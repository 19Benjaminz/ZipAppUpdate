import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAppSelector } from '../store';

const ModifyAddress: React.FC = () => {
  const { profile } = useAppSelector((state) => (state.userInfo))

  const [address, setAddress] = useState({
    addressline1: profile.addressLine1 || '',
    addressline2: profile.addressLine2 || '',
    city: profile.city || '',
    state: profile.state || '',
    zipcode: profile.zipcode || '',
  });

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

  const handleSave = () => {
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
        <Picker
          selectedValue={address.state}
          onValueChange={(value: string) => handleInputChange('state', value)}
          style={styles.picker}
        >
          <Picker.Item label="Select State" value="" />
          {states.map((state) => (
            <Picker.Item key={state} label={state} value={state} />
          ))}
        </Picker>
      </View>
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
    backgroundColor: 'white',
  },
  picker: {
    height: 50,
    backgroundColor: 'white',
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
