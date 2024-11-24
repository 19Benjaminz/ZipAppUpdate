import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../components/types';
import { useAppDispatch, useAppSelector } from '../store';

const PersonalInformation: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const { profile, member } = useAppSelector((state) => state.userInfo);

  const [personalInfo, setPersonalInfo] = useState({
    firstName: profile.firstName,
    lastName: profile.lastName,
    nickname: profile.nickName,
    email: member.email,
    phone: member.phone,
  });

  const [address] = useState({
    addressLine1: profile.addressLine1,
    addressLine2: profile.addressLine2,
    city: profile.city,
    state: profile.state,
    postalCode: profile.zipcode,
  });

  const toggleEditingPersonal = () => {
    setIsEditingPersonal(!isEditingPersonal);
  };

  const handleInputChange = (field: string, value: string) => {
    setPersonalInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditAddress = () => {
    navigation.navigate('Profile/ModifyAddress');
  };

  const formatAddress = () => {
    const { addressLine1, addressLine2, city, state, postalCode } = address;
    return `${addressLine1} ${addressLine2 ? addressLine2 + ',' : ''} ${city}, ${state}, ${postalCode}`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      {/* Personal Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={toggleEditingPersonal}
        >
          <Text style={styles.editButtonText}>
            {isEditingPersonal ? 'Save' : 'Edit'}
          </Text>
        </TouchableOpacity>
        {Object.entries(personalInfo).map(([key, value]) => (
          <View key={key} style={styles.fieldContainer}>
            <Text style={styles.label}>
              {key.replace(/^\w/, (c) => c.toUpperCase())}
            </Text>
            <TextInput
              style={[styles.input, !isEditingPersonal && styles.disabledInput]}
              value={value}
              onChangeText={(text) => handleInputChange(key, text)}
              editable={key !== 'email' && isEditingPersonal} // Email is not editable
            />
          </View>
        ))}
      </View>

      {/* Address Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Address</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEditAddress}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <Text style={styles.addressText}>{formatAddress()}</Text>
      </View>

      {/* Account Actions Section */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Modify Password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.logoutButton]}>
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
