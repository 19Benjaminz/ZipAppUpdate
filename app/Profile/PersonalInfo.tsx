import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../components/types';
import { useAppDispatch, useAppSelector } from '../store';
import { getUser, updateUserProfile } from '../features/userInfoSlice';
import { logout } from '../features/authSlice';
import * as SecureStore from 'expo-secure-store';


const PersonalInformation: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const { profile, member, accessToken, memberId } = useAppSelector((state) => state.userInfo);

  const [isEditingPersonal, setIsEditingPersonal] = useState(false);

  const [personalInfo, setPersonalInfo] = useState({
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    nickName: profile.nickName || '',
    email: member.email || '',
    phone: member.phone || '',
  });

  const [address, setAddress] = useState({
    addressLine1: profile.addressLine1 || '',
    addressLine2: profile.addressLine2 || '',
    city: profile.city || '',
    state: profile.state || '',
    postalCode: profile.zipcode || '',
  });

  const refreshData = useCallback(async () => {
    try {
      if (accessToken && memberId) {
        await dispatch(getUser({ accessToken, memberId })).unwrap();
        console.log('Profile data refreshed');
      }
    } catch (error) {
      console.error('Error refreshing profile data:', error);
    }
  }, [accessToken, memberId, dispatch]);

  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [refreshData])
  );

  useEffect(() => {
    setPersonalInfo({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      nickName: profile.nickName || '',
      email: member.email || '',
      phone: member.phone || '',
    });

    setAddress({
      addressLine1: profile.addressLine1 || '',
      addressLine2: profile.addressLine2 || '',
      city: profile.city || '',
      state: profile.state || '',
      postalCode: profile.zipcode || '',
    });
  }, [profile, member]);

  const toggleEditingPersonal = () => {
    if (isEditingPersonal) {
      handleEditProfile();
    }
    setIsEditingPersonal(!isEditingPersonal);
  };

  const handleInputChange = (field: string, value: string) => {
    setPersonalInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditAddress = () => {
    navigation.navigate('Profile/ModifyAddress');
  };

  const handleModifyPassword = () => {
    navigation.navigate('Profile/ModifyPassword');
  };

  const formatAddress = () => {
    const { addressLine1, addressLine2, city, state, postalCode } = address;
    return `${addressLine1 + ', '} ${addressLine2 ? addressLine2 + ', ' : ''} ${city}, ${state}, ${postalCode}`;
  };

  const handleEditProfile = async () => {
    if (!accessToken || !memberId) {
      Alert.alert('Error', 'Access token or member ID is missing. Please log in again.');
      return;
    }

    try {
      const payload: Partial<{
        _accessToken: string;
        _memberId: string;
        nickName?: string;
        firstName?: string;
        lastName?: string;
        houseHolderMember?: string;
        state?: string;
        city?: string;
        zipcode?: string;
        addressLine1?: string;
        addressLine2?: string;
        phone?: string;
        email?: string;
        birth?: string;
        sex?: string;
        avatar?: string;
        username?: string;
      }> = {
        _accessToken: accessToken,
        _memberId: memberId,
      };

      Object.keys(personalInfo).forEach((key) => {
        const currentValue = personalInfo[key as keyof typeof personalInfo];
        const originalValue = profile[key as keyof typeof profile] || member[key as keyof typeof member];
        if (currentValue !== originalValue) {
          payload[key as keyof typeof payload] = currentValue;
        }
      });

      if (Object.keys(payload).length > 2) {
        const resultAction = await dispatch(updateUserProfile(payload as Required<typeof payload>)).unwrap();
        Alert.alert('Success', 'Profile updated successfully');
        navigation.navigate('Zippora/ZipporaHome');
      } else {
        Alert.alert('No Changes', 'No changes were made to your profile.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleLogout = async () => {
    await dispatch(logout());
    console.log('logout success');
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('memberId');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login/Login' }],
    });
    return
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      {/* Personal Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <TouchableOpacity style={styles.editButton} onPress={toggleEditingPersonal}>
          <Text style={styles.editButtonText}>{isEditingPersonal ? 'Save' : 'Edit'}</Text>
        </TouchableOpacity>
        {Object.entries(personalInfo).map(([key, value]) => (
          <View key={key} style={styles.fieldContainer}>
            <Text style={styles.label}>{key.replace(/^\w/, (c) => c.toUpperCase())}</Text>
            <TextInput
              style={[styles.input, !isEditingPersonal && styles.disabledInput]}
              value={value}
              onChangeText={(text) => handleInputChange(key, text)}
              editable={key !== 'email' && isEditingPersonal}
            />
          </View>
        ))}
      </View>

      {/* Address Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Address</Text>
        <TouchableOpacity style={styles.editButton} onPress={handleEditAddress}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <Text style={styles.addressText}>{formatAddress()}</Text>
      </View>

      {/* Account Actions Section */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.actionButton} onPress={handleModifyPassword}>
          <Text style={styles.actionButtonText}>Modify Password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  section: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    position: 'relative',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: 'gray',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 8,
    backgroundColor: 'white',
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: 'gray',
  },
  addressText: {
    fontSize: 16,
    color: 'black',
    lineHeight: 24,
  },
  editButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'green',
    borderRadius: 4,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionButton: {
    padding: 12,
    backgroundColor: '#007BFF',
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: 'red',
  },
  logoutButtonText: {
    color: 'white',
  },
});

export default PersonalInformation;
