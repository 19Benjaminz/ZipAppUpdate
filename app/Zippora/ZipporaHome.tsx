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
  Modal,
  Animated,
  Easing,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { getCurrentDeviceToken } from '@/services/deviceToken';
import { secureStore } from '@/services/secureStore';
import ZIPText from '../../components/ZIPText';
import { RootStackParamList } from '../../components/types';
import { useAppDispatch, useAppSelector } from '@/store';
import { getUser, setAccessToken, setMemberId } from '../features/userInfoSlice';
import { fetchUserApartments, payPickupPenalty, validatePickupChargeRule, mergePenaltyPackages, PenaltyPackage } from '../features/zipporaInfoSlice';
import { login } from '../features/authSlice';
import { requestReview } from '@/components/rateApp';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getWalletBalance } from '../features/walletSlice';
import { isNeedLoginMessage } from '../config/apiClient';

const ZipporaHome: React.FC<{ setHomeLoading: (loading: boolean) => void }> = ({ setHomeLoading }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const { accessToken, memberId } = useAppSelector((state) => state.userInfo);
  const { apartmentList, penaltyByStore, penaltyValidation, payingPenaltyStoreId } = useAppSelector((state) => state.zipporaInfo);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [showPenaltyDetails, setShowPenaltyDetails] = useState(false);
  const [showScanSuccessBanner, setShowScanSuccessBanner] = useState(false);
  const scanBannerOpacity = React.useRef(new Animated.Value(0)).current;
  const scanBannerTranslateY = React.useRef(new Animated.Value(-8)).current;

  const unpaidPenaltyPackages = (penaltyValidation?.packages || []).filter((pkg) => !pkg.isPenaltyPaid);
  

  const fetchUserData = async () => {
    if (isFetchingData) return; // Prevent multiple fetch calls
    try {
      setHomeLoading(true);
      setIsFetchingData(true); // Set flag
  
      // Retrieve the latest accessToken
      const latestAccessToken = await secureStore.getItemAsync('accessToken');
      const latestMemberId = await secureStore.getItemAsync('memberId');

      if (latestAccessToken && latestMemberId) {
        if (accessToken !== latestAccessToken) {
          dispatch(setAccessToken(latestAccessToken));
        }
        if (memberId !== latestMemberId) {
          dispatch(setMemberId(latestMemberId));
        }
      }

      const credentials = {
        accessToken: latestAccessToken || '',
        memberId: latestMemberId || '',
      };
      console.log('Fetching user data with credentials:', credentials);
  
      if (latestAccessToken && latestMemberId) {
        const resultAction = await dispatch(getUser(credentials));
  
        if (getUser.fulfilled.match(resultAction)) {
          console.log('User data fetched successfully');
        } else if (isNeedLoginMessage(resultAction.payload)) {
          console.log('Access token expired. Returning to login screen.');
          return;
        } else {
          console.error('Failed to fetch user data:', resultAction.payload || resultAction.error);
          Alert.alert('Error', 'Failed to fetch user data. Please try again.');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login/Login' }],
          });
        }
      } else {
        console.error('Missing credentials: Access Token or Member ID');
        Alert.alert('Error', 'User credentials are missing. Please log in again.');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login/Login' }],
        });
      }
    } catch (error) {
      if (isNeedLoginMessage((error as any)?.message)) {
        return;
      }
      console.error('Unexpected error fetching user data:', error);
      Alert.alert('Error', 'An unexpected error occurred while fetching user data.');
    } finally {
      setIsFetchingData(false); // Reset flag
      setHomeLoading(false);
    }
  };
  

  const fetchZipporaData = async () => {
    setHomeLoading(true);
    await dispatch(fetchUserApartments());
    const result = await dispatch(validatePickupChargeRule(undefined));

    // Backend returns penaltyAmount=0 when called without storeId.
    // Re-fetch per storeId for any overdue unpaid packages to get the real amount.
    if (validatePickupChargeRule.fulfilled.match(result)) {
      const needsRefetch = result.payload.packages.filter(
        (pkg: PenaltyPackage) => !pkg.isPenaltyPaid && pkg.overdueDays > 0 && Number(pkg.penaltyAmount) === 0
      );
      if (needsRefetch.length > 0) {
        const perStoreResults = await Promise.all(
          needsRefetch.map((pkg: PenaltyPackage) => dispatch(validatePickupChargeRule({ storeId: pkg.storeId })))
        );
        const mergedPackages = perStoreResults
          .filter((r) => validatePickupChargeRule.fulfilled.match(r))
          .flatMap((r: any) => r.payload.packages);
        if (mergedPackages.length > 0) {
          dispatch(mergePenaltyPackages(mergedPackages));
        }
      }
    }

    setHomeLoading(false);
  };

  const handlePayPenalty = (storeId: string) => {
    Alert.alert(
      'Pay Penalty',
      'This will deduct the overdue penalty from your wallet. Once paid, the penalty is locked and no extra overdue charges will be added at pickup.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pay Now',
          onPress: async () => {
            try {
              const paymentResult: any = await dispatch(payPickupPenalty({ storeId })).unwrap();
              await dispatch(validatePickupChargeRule(undefined));
              if (accessToken && memberId) {
                dispatch(getWalletBalance({ accessToken, memberId }));
              }

              Alert.alert(
                'Penalty Paid',
                `Paid $${Number(paymentResult.paidAmount || 0).toFixed(2)}. You can now pick up this package without extra penalty.`
              );
            } catch (error: any) {
              if (error?.code === 2) {
                Alert.alert(
                  'Insufficient Wallet Balance',
                  `Required: $${Number(error.requiredAmount || 0).toFixed(2)}\nCurrent: $${Number(error.currentBalance || 0).toFixed(2)}\n\nPlease recharge wallet first.`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Recharge Wallet',
                      onPress: () => navigation.navigate('Profile/Wallet/Recharge' as never),
                    },
                  ]
                );
                return;
              }

              Alert.alert('Payment Failed', error?.message || 'Failed to pay penalty. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handlePayAllPenalties = () => {
    Alert.alert(
      'Pay All Penalties',
      'This will pay all unpaid package penalties from wallet. Paid penalties are locked and no extra charges will be added at pickup.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pay All',
          onPress: async () => {
            try {
              const paymentResult: any = await dispatch(payPickupPenalty(undefined)).unwrap();
              await dispatch(validatePickupChargeRule(undefined));
              if (accessToken && memberId) {
                dispatch(getWalletBalance({ accessToken, memberId }));
              }

              setShowPenaltyDetails(false);
              Alert.alert(
                'Penalty Paid',
                `Paid $${Number(paymentResult.paidAmount || 0).toFixed(2)} for ${paymentResult.paidPackages?.length || 0} package(s).`
              );
            } catch (error: any) {
              if (error?.code === 2) {
                Alert.alert(
                  'Insufficient Wallet Balance',
                  `Required: $${Number(error.requiredAmount || 0).toFixed(2)}\nCurrent: $${Number(error.currentBalance || 0).toFixed(2)}\n\nPlease recharge wallet first.`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Recharge Wallet',
                      onPress: () => navigation.navigate('Profile/Wallet/Recharge' as never),
                    },
                  ]
                );
                return;
              }

              Alert.alert('Payment Failed', error?.message || 'Failed to pay penalties. Please try again.');
            }
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    await fetchZipporaData();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      let hideBannerTimer: ReturnType<typeof setTimeout> | null = null;

      const fetchData = async () => {
        if (isFetchingData) return; // Prevent redundant calls

        let resolvedAccessToken = accessToken;
        let resolvedMemberId = memberId;

        if (!resolvedAccessToken || !resolvedMemberId) {
          const storedAccessToken = await secureStore.getItemAsync('accessToken');
          const storedMemberId = await secureStore.getItemAsync('memberId');

          if (storedAccessToken && storedMemberId) {
            resolvedAccessToken = storedAccessToken;
            resolvedMemberId = storedMemberId;
            if (accessToken !== storedAccessToken) {
              dispatch(setAccessToken(storedAccessToken));
            }
            if (memberId !== storedMemberId) {
              dispatch(setMemberId(storedMemberId));
            }
          }
        }

        if (resolvedAccessToken && resolvedMemberId) {
          await fetchUserData();
          await fetchZipporaData();
          setLoading(false);
        } else {
          console.error('Missing credentials: Access Token or Member ID');
          setTimeout(() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login/Login' }],
            });
          }, 0);
        }
      };

      const showBannerAfterScan = async () => {
        try {
          const scanAt = await AsyncStorage.getItem('lastScanSuccessAt');
          if (!scanAt) return;

          const scanTimestamp = Number(scanAt);
          const isRecent = !Number.isNaN(scanTimestamp) && Date.now() - scanTimestamp < 15000;
          await AsyncStorage.removeItem('lastScanSuccessAt');

          if (isRecent) {
            setShowScanSuccessBanner(true);

            scanBannerOpacity.setValue(0);
            scanBannerTranslateY.setValue(-8);

            Animated.parallel([
              Animated.timing(scanBannerOpacity, {
                toValue: 1,
                duration: 180,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
              Animated.timing(scanBannerTranslateY, {
                toValue: 0,
                duration: 220,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
            ]).start();

            hideBannerTimer = setTimeout(() => {
              Animated.parallel([
                Animated.timing(scanBannerOpacity, {
                  toValue: 0,
                  duration: 160,
                  easing: Easing.in(Easing.cubic),
                  useNativeDriver: true,
                }),
                Animated.timing(scanBannerTranslateY, {
                  toValue: -6,
                  duration: 160,
                  easing: Easing.in(Easing.cubic),
                  useNativeDriver: true,
                }),
              ]).start(() => {
                setShowScanSuccessBanner(false);
              });
            }, 2000);
          }
        } catch (error) {
          console.error('Failed to read scan success marker', error);
        }
      };
  
      fetchData();
      showBannerAfterScan();

      return () => {
        if (hideBannerTimer) {
          clearTimeout(hideBannerTimer);
        }
      };
    }, [accessToken, memberId, dispatch])
  );

  useEffect(() => {
    // Removed app launch counting; counting now occurs per successful QR scan.
  }, []);

  useEffect(() => {
    if (!__DEV__) return;

    const cabinet10108 = apartmentList.flatMap((apt) =>
      (apt.zipporaList || [])
        .filter((locker) => String(locker.cabinetId) === '10108')
        .flatMap((locker) =>
          (locker.storeList || []).map((order) => {
            const rawStoreId = String(order.storeId);
            const normalizedStoreId = rawStoreId.trim();
            const byTrim = penaltyByStore[normalizedStoreId];
            const byNumeric = penaltyByStore[String(Number(normalizedStoreId))];
            return {
              cabinetId: locker.cabinetId,
              pickCode: order.pickCode,
              rawStoreId,
              normalizedStoreId,
              hasPenaltyByTrim: !!byTrim,
              hasPenaltyByNumeric: !!byNumeric,
              matchedPenalty: byTrim || byNumeric || null,
            };
          })
        )
    );

    console.log('[Penalty][Home] penaltyByStore keys', Object.keys(penaltyByStore));
    console.log('[Penalty][Home] cabinet 10108 store matching', cabinet10108);
  }, [apartmentList, penaltyByStore]);
  
  

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
      style={styles.scroll}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {showScanSuccessBanner && (
        <Animated.View
          style={[
            styles.scanSuccessBanner,
            {
              opacity: scanBannerOpacity,
              transform: [{ translateY: scanBannerTranslateY }],
            },
          ]}
        >
          <ZIPText style={styles.scanSuccessBannerText}>QR code scanned successfully</ZIPText>
        </Animated.View>
      )}

      {!!penaltyValidation && penaltyValidation.totalPenalty > 0 && (
        <View style={styles.penaltySummaryBanner}>
          <ZIPText style={styles.penaltySummaryTitle}>Overdue Penalty Pending</ZIPText>
          <ZIPText style={styles.penaltySummaryValue}>
            Total: ${Number(penaltyValidation.totalPenalty).toFixed(2)}
          </ZIPText>
          <View style={styles.penaltySummaryActions}>
            <TouchableOpacity
              style={[styles.penaltySummaryActionButton, styles.penaltySummaryActionOutline]}
              onPress={() => setShowPenaltyDetails(true)}
            >
              <ZIPText style={styles.penaltySummaryActionOutlineText}>Details</ZIPText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.penaltySummaryActionButton}
              disabled={payingPenaltyStoreId === 'ALL'}
              onPress={handlePayAllPenalties}
            >
              <ZIPText style={styles.penaltySummaryActionText}>
                {payingPenaltyStoreId === 'ALL' ? 'Paying...' : 'Pay All'}
              </ZIPText>
            </TouchableOpacity>
          </View>
        </View>
      )}

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
  
          {apt.zipporaList.length == 0 ? null : (
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
  
                  {locker.storeList.map((order) => {
                    const normalizedOrderStoreId = String(order.storeId).trim();
                    const storePenalty =
                      penaltyByStore[normalizedOrderStoreId] || penaltyByStore[String(Number(normalizedOrderStoreId))];
                    if (__DEV__) {
                      console.log('[Penalty][Render] cabinetId:', locker.cabinetId, 'storeId:', order.storeId,
                        '| normalizedKey:', normalizedOrderStoreId,
                        '| penaltyByStore keys:', Object.keys(penaltyByStore),
                        '| matched:', !!storePenalty,
                        '| storePenalty:', storePenalty);
                    }
                    const penaltyAmount = Number(storePenalty?.penaltyAmount || 0);
                    const paidAmount = Number(storePenalty?.paidAmount || 0);
                    const shouldShowPenalty = storePenalty
                      ? storePenalty.isPenaltyPaid
                        ? (paidAmount > 0 || penaltyAmount > 0)
                        : penaltyAmount > 0
                      : false;

                    return (
                    <React.Fragment key={order.pickCode}>
                      <View style={styles.zipporaOrders}>
                        <View style={styles.orderItem}>
                          <ZIPText style={styles.courierName}>{order.courierCompanyName}</ZIPText>
                          <ZIPText numberOfLines={1} style={styles.pickupCodeText}>
                            Pickup Code:
                            <ZIPText style={styles.pickupCode}> {order.pickCode} </ZIPText>
                          </ZIPText>
                          <Text numberOfLines={1} style={styles.storeTime}>Store Time: {order.storeTime}</Text>

                          {shouldShowPenalty && (
                            <View style={styles.penaltyContainer}>
                              {storePenalty.isPenaltyPaid ? (
                                <ZIPText style={styles.penaltyPaidText}>
                                  Penalty prepaid: ${Number(storePenalty.paidAmount || storePenalty.penaltyAmount || 0).toFixed(2)}
                                </ZIPText>
                              ) : (
                                <>
                                  <ZIPText style={styles.penaltyDueText}>
                                    Overdue {storePenalty.overdueDays} day(s) • Penalty ${Number(storePenalty.penaltyAmount || 0).toFixed(2)}
                                  </ZIPText>
                                  <TouchableOpacity
                                    style={styles.payPenaltyButton}
                                    disabled={payingPenaltyStoreId === normalizedOrderStoreId}
                                    onPress={() => handlePayPenalty(normalizedOrderStoreId)}
                                  >
                                    <ZIPText style={styles.payPenaltyButtonText}>
                                      {payingPenaltyStoreId === normalizedOrderStoreId ? 'Paying...' : 'Pay Penalty'}
                                    </ZIPText>
                                  </TouchableOpacity>
                                </>
                              )}
                            </View>
                          )}
                        </View>
                      </View>
                    </React.Fragment>
                    );
                  })}
                  <View style={{ height: 10 }} />
                </React.Fragment>
              ))}
            </View>
          )}
        </React.Fragment>
      ))}
  
      {/* Conditional rendering for subscription button */}
      {apartmentList.length === 0 && (
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
      )}

      <Modal
        visible={showPenaltyDetails}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPenaltyDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <ZIPText style={styles.modalTitle}>Penalty Details</ZIPText>
              <TouchableOpacity onPress={() => setShowPenaltyDetails(false)}>
                <Icon name="close" size={22} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {unpaidPenaltyPackages.length === 0 ? (
                <ZIPText style={styles.modalEmptyText}>No unpaid penalties.</ZIPText>
              ) : (
                unpaidPenaltyPackages.map((pkg) => (
                  <View key={pkg.storeId} style={styles.penaltyRow}>
                    <ZIPText style={styles.penaltyRowTitle}>Store ID: {pkg.storeId}</ZIPText>
                    <ZIPText style={styles.penaltyRowMeta}>Overdue: {pkg.overdueDays} day(s)</ZIPText>
                    <ZIPText style={styles.penaltyRowAmount}>Penalty: ${Number(pkg.penaltyAmount || 0).toFixed(2)}</ZIPText>
                  </View>
                ))
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setShowPenaltyDetails(false)}>
                <ZIPText style={styles.modalCancelText}>Close</ZIPText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalPayAllButton}
                disabled={unpaidPenaltyPackages.length === 0 || payingPenaltyStoreId === 'ALL'}
                onPress={handlePayAllPenalties}
              >
                <ZIPText style={styles.modalPayAllText}>
                  {payingPenaltyStoreId === 'ALL' ? 'Paying...' : 'Pay All'}
                </ZIPText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );    
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#F5F5F5', // ensure background fills full viewport
  },
  container: {
    padding: 16,
    backgroundColor: '#F5F5F5',
    flexGrow: 1, // expand to fill remaining space when content is short
    paddingBottom: 120, // leave space above bottom nav + camera FAB
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
  penaltySummaryBanner: {
    backgroundColor: '#FFF4E5',
    borderColor: '#FFB74D',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  penaltySummaryTitle: {
    color: '#7A4B00',
    fontSize: 14,
    fontWeight: '600',
  },
  penaltySummaryValue: {
    color: '#7A4B00',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  penaltySummaryActions: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
  },
  penaltySummaryActionButton: {
    backgroundColor: '#EA580C',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  penaltySummaryActionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  penaltySummaryActionOutline: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EA580C',
  },
  penaltySummaryActionOutlineText: {
    color: '#EA580C',
    fontWeight: '700',
    fontSize: 13,
  },
  scanSuccessBanner: {
    backgroundColor: '#E7F7ED',
    borderColor: '#2E9F60',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  scanSuccessBannerText: {
    color: '#1E6E43',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
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
  penaltyContainer: {
    marginTop: 8,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  penaltyDueText: {
    color: '#B45309',
    fontSize: 13,
    marginBottom: 8,
  },
  penaltyPaidText: {
    color: '#047857',
    fontSize: 13,
    fontWeight: '600',
  },
  payPenaltyButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#EA580C',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  payPenaltyButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  modalContent: {
    marginBottom: 12,
  },
  modalEmptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  penaltyRow: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#FAFAFA',
  },
  penaltyRowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  penaltyRowMeta: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  penaltyRowAmount: {
    fontSize: 13,
    color: '#B45309',
    fontWeight: '700',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  modalCancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#374151',
    fontWeight: '600',
  },
  modalPayAllButton: {
    flex: 1,
    backgroundColor: '#EA580C',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalPayAllText: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default ZipporaHome;
