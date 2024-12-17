import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import ZIPText from '../../components/ZIPText';
import { RootStackParamList } from '../../components/types';
import { useAppDispatch, useAppSelector } from '../store';
import { getUser } from '../features/userInfoSlice';
import { fetchUserApartments } from '../features/zipporaInfoSlice';

const ZipporaHome: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const { accessToken, memberId } = useAppSelector((state) => state.userInfo);
  const { apartmentList} = useAppSelector((state) => state.zipporaInfo);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    console.log("<<<<<<<<<<<<<<<Zippora Home>>>>>>>>>>>>>>>>>>>>>")
    console.log("accesstoken: ", accessToken);
    console.log("memberId: ", memberId);
    const credentials = {
      accessToken: accessToken || '',
      memberId: memberId || '',
    };

    if (accessToken && memberId) {
      try {
        const resultAction = await dispatch(getUser(credentials));
        if (getUser.fulfilled.match(resultAction)) {
          console.log('User data fetched successfully:', resultAction.payload);
        } else {
          console.error('Failed to fetch user data:', resultAction.payload || resultAction.error);
          Alert.alert('Error', 'Failed to fetch user data. Please try again.');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login/Login' }],
          });
        }
      } catch (error) {
        console.error('Unexpected error fetching user data:', error);
        Alert.alert('Error', 'An unexpected error occurred while fetching user data.');
      }
    } else {
      console.error('Missing credentials: Access Token or Member ID');
      Alert.alert('Error', 'User credentials are missing. Please log in again.');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login/Login' }],
      });
    }
  };

  const fetchZipporaData = async () => {
    await dispatch(fetchUserApartments());
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    await fetchZipporaData();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
        if (accessToken && memberId) { // Wait until credentials are ready
            fetchUserData();
            fetchZipporaData();
            setLoading(false);
        }
        else {
          console.error('---Missing credentials: Access Token or Member ID');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login/Login' }],
          });
        }
    }, [dispatch, accessToken, memberId])
);

  const handleAPTInfo = () => {
    navigation.navigate('Zippora/ZipporaInfo')
  };

  const handleSubscribeNavigation = () => {
    navigation.navigate('Zippora/SubToAPT');
  };

  // Show loading spinner if still loading
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="green" />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {apartmentList.map((apt) => (
        <React.Fragment key={apt.apartmentId}>
          <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={handleAPTInfo}>
            <Image source={require('../../assets/images/room.png')} style={styles.image} />
            <View style={styles.infoContainer}>
              <ZIPText style={styles.title}>{apt.apartmentName} </ZIPText>
              <ZIPText style={styles.subTitle}>Unit: {apt.unitName} </ZIPText>
              <View style={styles.statusContainer}>
                <ZIPText style={styles.pendingCount}>{apt.zipporaCount} Zippora</ZIPText>
                <Text style={styles.statusText}>
                  {apt.approveStatus === "0" && "Pending Management Approval"}
                </Text>
              </View>
            </View>
            <Icon name="arrow-forward-ios" color="green" size={24} style={styles.icon} />
          </TouchableOpacity>
        
          {apt.zipporaList.length == 0 ? null
            :
            <View style={styles.zipporaOrderContainer}>
              {apt.zipporaList.map((locker) => (
                <React.Fragment key={locker.cabinetId}>
                  <View style={styles.zipporaContainer}>
                    <Image
                      source={require('../../assets/images/locker.png')}
                      style={styles.iconImage}
                    />
                    <ZIPText style={styles.cabinetId}>{locker.cabinetId}</ZIPText>
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                      <ZIPText style={styles.packageText}>{locker.storeCount} packages to pick up</ZIPText>
                    </View>
                  </View>

                  {locker.storeList.map((order) => (
                    <React.Fragment key={order.pickCode}>
                      <View style={styles.zipporaOrders}>
                        <View style={styles.orderItem}>
                          <ZIPText style={styles.courierName}>{ order.courierCompanyName }</ZIPText>
                          <ZIPText numberOfLines={1} style={styles.pickupCodeText}>
                            Pickup Code:
                            <ZIPText style={styles.pickupCode}> { order.pickCode } </ZIPText>
                          </ZIPText>
                          <Text numberOfLines={1} style={styles.storeTime}>Store Time: { order.storeTime }</Text>
                        </View>
                      </View>
                    </React.Fragment>
                  ))}
                  <View style={{height: 10}}/>
                </React.Fragment>
              ))}
            </View>
          }
        </React.Fragment>
      ))}
  
      {/* Round Button and Text */}
      <View style={styles.subscriptionContainer}>
        <TouchableOpacity
          style={styles.roundButton}
          activeOpacity={0.7}
          onPress={handleSubscribeNavigation}
        >
          <Icon name="home" color="white" size={30} />
        </TouchableOpacity>
        <Text style={styles.subscriptionText}>Click Here to Subscribe to an Apartment</Text>
      </View>
    </ScrollView>
  );  
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    elevation: 3, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    alignItems: 'center',
    marginBottom: 16,
  },
  image: {
    width: 45,
    height: 45,
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  subTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pendingCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'green',
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: 'red',
  },
  icon: {
    marginLeft: 10,
  },
  zipporaOrderContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  zipporaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconImage: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  cabinetId: {
    marginLeft: 10,
    color: '#666',
    fontWeight: 900,
    fontSize: 16,
  },
  packageText: {
    textAlign: 'right',
    color: '#666',
  },
  zipporaOrders: {
    paddingLeft: 40,
    borderTopColor: 'lightgray',
    borderTopWidth: 1,
    paddingTop: 10,
    marginBottom: 10
  },
  orderItem: {
    flexDirection: 'column',
    marginTop: 8,
  },
  courierName: {
    fontSize: 14,
    color: '#999',
  },
  pickupCodeText: {
    fontSize: 18,
    color: '#666',
  },
  pickupCode: {
    fontFamily: 'Menlo',
    color: 'red',
  },
  storeTime: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'Menlo',
  },
  subscriptionContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  roundButton: {
    backgroundColor: 'green',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.7,
  },
  subscriptionText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
});

export default ZipporaHome;
