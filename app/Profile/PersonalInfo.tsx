import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Platform
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../components/types';
import { useAppDispatch, useAppSelector } from '../store';
import { getUser, updateUserProfile } from '../features/userInfoSlice';
import { logout } from '../features/authSlice';
import { md5Hash } from '../Actions/ToMD5';
import * as ImagePicker from 'expo-image-picker';


const PersonalInformation: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const { profile, member, accessToken, memberId } = useAppSelector((state) => state.userInfo);
  //console.log(profile);

  const [avatar, setAvatar] = useState(profile.avatar || '');

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

  const [houseHolderMember, setHouseHolderMember] = useState('');
  const [newMember, setNewMember] = useState('');
  const [isEditingHouseholdMember, setIsEditingHouseholdMember] = useState(false);


  const refreshData = useCallback(async () => {
    try {
      if (accessToken && memberId) {
        await dispatch(getUser({ accessToken, memberId })).unwrap();
      }
    } catch (error) {
      console.error('Error refreshing profile data:', error);
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Zippora/ZipporaHome' }],
        });
      }, 0);
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

    setHouseHolderMember(profile.houseHolderMember || '');
  }, [profile, member]);

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'You need to grant permission to access the gallery.');
      return;
    }
  
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    console.log("..................")
    console.log(result);
  
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      console.log(uri);
      setAvatar(uri);
      uploadAvatar(uri);
    }
  };

  const uploadAvatar = async (imageUri: string) => {
    if (!accessToken || !memberId) {
      Alert.alert('Error', 'Access token or member ID is missing. Please log in again.');
      return;
    }
  
    try {
      //Ensure correct format for Android/iOS
      const formattedUri = Platform.OS === 'android' ? imageUri : `file://${imageUri}`;
  
      //Hash the filename using MD5
      const hashedFileName = md5Hash(formattedUri) + '.jpg';
  
      //Prepare FormData for upload
      let formData = new FormData();
      formData.append('avatar', {
        uri: formattedUri,
        name: hashedFileName,
        type: 'image/jpeg',
      } as any);
  
      console.log("Uploading File:", hashedFileName);
  
      const payload = {
        _accessToken: accessToken,
        _memberId: memberId,
        avatar: formattedUri,
      };
  
      const result = await dispatch(updateUserProfile(payload));
      console.log(result)
      Alert.alert('Success', 'Avatar updated successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      Alert.alert('Error', 'Failed to upload avatar. Please try again.');
    }
  };

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
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login/Login' }],
    });
    return
  }

  const handleAddMember = () => {
    if (newMember.trim() !== '') {
        setHouseHolderMember((prev) => prev ? `${prev}, ${newMember.trim()}` : newMember.trim());
        setNewMember('');
    }
  };

  const handleSaveMembers = async () => {
    if (newMember.trim() !== '') {
        const updatedValue = houseHolderMember ? `${houseHolderMember}, ${newMember.trim()}` : newMember.trim();

        try {
            //Await the Redux action to get the real response
            const response = await dispatch(updateUserProfile({
                _accessToken: '',
                _memberId: '',
                householderMember: updatedValue
            })).unwrap(); // ✅ Extracts the result from Redux

            //Update local state AFTER Redux update
            setHouseHolderMember(updatedValue);
            setNewMember('');
            setIsEditingHouseholdMember(false);

            refreshData();
        } catch (error) {
            console.error('Error updating Household Members:', error);
            Alert.alert('Error', 'Failed to update Household Members. Please try again.');
        }
    }
  };

  const handleDeleteMember = async (memberToRemove: string) => {
    // Create updated household member list (remove selected member)
    const updatedValue = houseHolderMember
        .split(',')
        .map(member => member.trim()) // Ensure no extra spaces
        .filter(member => member !== memberToRemove) // Remove the selected member
        .join(', '); // Reconstruct the string

    try {
        //Await Redux update before setting the new state
        const response = await dispatch(updateUserProfile({
            _accessToken: '',
            _memberId: '',
            householderMember: updatedValue
        })).unwrap();

        //Update state only after Redux successfully updates
        setHouseHolderMember(updatedValue);

        refreshData();
    } catch (error) {
        console.error('Error deleting household member:', error);
        Alert.alert('Error', 'Failed to delete household member. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      {/* Avatar Section */}
      {/* <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
        <Image source={avatar ? { uri: avatar } : require('../../assets/images/proimage.png')} style={styles.avatar} />
      </TouchableOpacity>
      <Text style={styles.avatarText}>Tap to change avatar</Text> */}

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

      {/* Household member section Section */}
      {/* <View style={styles.section}>
        <Text style={styles.sectionTitle}>Household Members</Text>
        <TouchableOpacity style={styles.editButton} onPress={handleEditAddress}>
          <Text style={styles.editButtonText}>Add</Text>
        </TouchableOpacity>
      </View> */}

      <View style={styles.section}>
          <Text style={styles.sectionTitle}>Household Members</Text>

          {/* Toggle between "Add" and "Cancel" button */}
          <TouchableOpacity 
              style={styles.editButton} 
              onPress={() => setIsEditingHouseholdMember(!isEditingHouseholdMember)}
          >
              <Text style={styles.editButtonText}>{isEditingHouseholdMember ? 'Cancel' : 'Edit'}</Text>
          </TouchableOpacity>

          {/* Display household members in individual cells with a delete button */}
          <View style={styles.householdMemberList}>
              {houseHolderMember
                  ? houseHolderMember.split(',').map((member, index) => (
                      <View key={index} style={styles.householdMemberCell}>
                          <Text style={styles.householdMemberText}>{member.trim()}</Text>

                          {/* Show delete button only in edit mode */}
                          {isEditingHouseholdMember && (
                              <TouchableOpacity 
                                  style={styles.deleteButton} 
                                  onPress={() => handleDeleteMember(member.trim())}
                              >
                                  <Text style={styles.deleteButtonText}>Delete</Text>
                              </TouchableOpacity>
                          )}
                      </View>
                  ))
                  : <Text style={styles.noMembersText}>No members added</Text>
              }
          </View>

          {/* Show input field when adding a new member */}
          {isEditingHouseholdMember && (
              <View style={styles.addMemberContainer}>
                  <TextInput
                      style={styles.input}
                      placeholder="Enter FULL Name"
                      value={newMember}
                      onChangeText={setNewMember}
                  />

                  {/* Buttons: Disabled if input is empty */}
                  <View style={styles.buttonContainer}>
                      <TouchableOpacity 
                          style={[styles.addButton, newMember.trim() === '' && styles.disabledButton]} 
                          onPress={handleAddMember}
                          disabled={newMember.trim() === ''}
                      >
                          <Text style={styles.buttonText}>Add Another</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                          style={[styles.saveButton, newMember.trim() === '' && styles.disabledButton]} 
                          onPress={handleSaveMembers}
                          disabled={newMember.trim() === ''}
                      >
                          <Text style={styles.buttonText}>Save</Text>
                      </TouchableOpacity>
                  </View>
              </View>
          )}
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
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  avatarText: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 20,
  },
  householdMemberContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  householdMemberText: {
    fontSize: 16,
    color: 'black',
  },
  addMemberContainer: {
      marginTop: 10,
  },
  buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
  },
  addButton: {
      backgroundColor: 'blue',
      padding: 10,
      borderRadius: 5,
      flex: 1,
      marginRight: 5,
      alignItems: 'center',
  },
  saveButton: {
      backgroundColor: 'green',
      padding: 10,
      borderRadius: 5,
      flex: 1,
      marginLeft: 5,
      alignItems: 'center',
  },
  disabledButton: {
      backgroundColor: 'gray',
      opacity: 0.5,
  },
  buttonText: {
      color: 'white',
      fontSize: 16,
  },
  householdMemberList: {
    marginTop: 10,
  },
  householdMemberCell: {
    flexDirection: 'row', // ✅ Align name and button in a row
    justifyContent: 'space-between', // ✅ Pushes delete button to the right
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  noMembersText: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
  },
  deleteButton: {
    backgroundColor: 'red',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  }
});

export default PersonalInformation;
