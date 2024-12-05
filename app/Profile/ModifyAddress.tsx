import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { useAppDispatch, useAppSelector } from '../store';
import { updateUserProfile } from '../features/userInfoSlice';
import { RootStackParamList } from '@/components/types';

const ModifyAddress: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { profile } = useAppSelector((state) => state.userInfo);
  const dispatch = useAppDispatch();

  const [address, setAddress] = useState({
    addressline1: profile.addressLine1 || '',
    addressline2: profile.addressLine2 || '',
    city: profile.city || '',
    state: profile.state || '',
    zipcode: profile.zipcode || '',
  });

  const [isPickerVisible, setPickerVisible] = useState(false);

  const states = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
    'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
  ];

  const handleInputChange = (field: keyof typeof address, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const updateAddressAction = await dispatch(
        updateUserProfile({
          _accessToken: '',
          _memberId: '',
          ...address,
        })
      );
      navigation.navigate('Profile/PersonalInfo');
    } catch (error: any) {
      console.error('Error updating Address:', error);
      Alert.alert('Error', 'Failed to Update Address. Please try again.');
    }
    console.log('Address saved:', address);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.sectionTitle}>Modify Address</Text>
      {['Address Line 1', 'Address Line 2', 'City', 'Zipcode'].map((field) => (
        <View key={field} style={styles.fieldContainer}>
          <Text style={styles.label}>{field}</Text>
          <TextInput
            style={styles.input}
            placeholder={`Enter ${field}`}
            value={address[field.replace(/\s/g, '').toLowerCase() as keyof typeof address]}
            onChangeText={(text) =>
              handleInputChange(field.replace(' ', '').toLowerCase() as keyof typeof address, text)
            }
          />
        </View>
      ))}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>State</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setPickerVisible(true)}
        >
          <Text style={styles.pickerText}>
            {address.state || 'Select State'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal for Picker */}
      <Modal visible={isPickerVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={address.state}
              onValueChange={(value) => {
                handleInputChange('state', value);
                setPickerVisible(false);
              }}
            >
              <Picker.Item label="Select State" value="" />
              {states.map((state) => (
                <Picker.Item key={state} label={state} value={state} />
              ))}
            </Picker>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setPickerVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Address</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  pickerText: {
    fontSize: 16,
    color: 'black',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  closeButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: 'red',
  },
  button: {
    padding: 12,
    backgroundColor: 'green',
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ModifyAddress;
