import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useAppDispatch } from '../store';
import { changePassword } from '../features/userInfoSlice';
import { md5Hash } from '../Actions/ToMD5';
import { RootStackParamList } from '@/components/types';

const ModifyPassword = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const { currentPassword, newPassword, confirmPassword} = form;

    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New password and confirmation do not match.');
      return;
    }

    try {
      await dispatch(changePassword({ oldPsd: md5Hash(currentPassword), psd1: md5Hash(newPassword), psd2: md5Hash(confirmPassword) })).unwrap();
      Alert.alert('Success', 'Password updated successfully.');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      navigation.navigate('Profile/PersonalInfo')
    } catch (error) {
      console.error('Error updating password:', error);
      Alert.alert('Error', 'Failed to update password. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>Modify Password</Text>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Current Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="Enter current password"
          value={form.currentPassword}
          onChangeText={(text) => handleChange('currentPassword', text)}
        />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>New Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="Enter new password"
          value={form.newPassword}
          onChangeText={(text) => handleChange('newPassword', text)}
        />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Confirm New Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="Confirm new password"
          value={form.confirmPassword}
          onChangeText={(text) => handleChange('confirmPassword', text)}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Update Password</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
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
    flex: 1,
  },
  vcodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vcodeInput: {
    flex: 3,
    marginRight: 8,
  },
  vcodeButton: {
    flex: 2,
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  vcodeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  button: {
    marginTop: 20,
    padding: 12,
    backgroundColor: 'blue',
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ModifyPassword;
