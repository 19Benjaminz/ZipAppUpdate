import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useAppDispatch } from '../store';
import { useRoute, useNavigation, NavigationProp } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '@/components/types';
import { resetPassword } from '../features/authSlice';
import ZIPText from '@/components/ZIPText';
import { md5Hash } from '../Actions/ToMD5';

const ForgotPasswordForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const route = useRoute();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { memberId, email } = route.params as { memberId: string, email: string };

  const [form, setForm] = useState({
    memberId: memberId,
    newPassword: '',
    confirmPassword: '',
    verificationCode: '',
  });

  const [showPassword, setShowPassword] = useState({
    newPassword: false,
    confirmPassword: false,
  });

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleTogglePasswordVisibility = (field: keyof typeof showPassword) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async () => {
    const { memberId, newPassword, confirmPassword, verificationCode } = form;

    if (!newPassword || !confirmPassword || !verificationCode) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New password and confirmation do not match.');
      return;
    }

    try {
      // Simulate API request to reset password
      const response = await dispatch(resetPassword({memberId: memberId, psd1: md5Hash(newPassword), psd2: md5Hash(confirmPassword), vcode: verificationCode}));
      console.log('Resetting password for email:', email);
      Alert.alert('Success', 'Password has been reset successfully.');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login/Login' }],
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      Alert.alert('Error', 'Failed to reset password. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
        <ZIPText style={styles.title}>Reset Password</ZIPText>
        <ZIPText style={styles.subtitle}>
            Enter the verification code sent to {email}.
        </ZIPText>

      <View style={styles.fieldContainer}>
        <ZIPText style={styles.label}>Verification Code</ZIPText>
        <View style={styles.passwordContainer}>
            <TextInput
            style={styles.input}
            placeholder="Enter verification code"
            value={form.verificationCode}
            onChangeText={(text) => handleChange('verificationCode', text)}
            />
        </View>
      </View>

      <View style={styles.fieldContainer}>
        <ZIPText style={styles.label}>New Password</ZIPText>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            secureTextEntry={!showPassword.newPassword}
            placeholder="Enter new password"
            value={form.newPassword}
            onChangeText={(text) => handleChange('newPassword', text)}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => handleTogglePasswordVisibility('newPassword')}
          >
            <MaterialIcons
              name={showPassword.newPassword ? 'visibility' : 'visibility-off'}
              size={24}
              color="gray"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.fieldContainer}>
        <ZIPText style={styles.label}>Confirm New Password</ZIPText>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            secureTextEntry={!showPassword.confirmPassword}
            placeholder="Confirm new password"
            value={form.confirmPassword}
            onChangeText={(text) => handleChange('confirmPassword', text)}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => handleTogglePasswordVisibility('confirmPassword')}
          >
            <MaterialIcons
              name={showPassword.confirmPassword ? 'visibility' : 'visibility-off'}
              size={24}
              color="gray"
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <ZIPText style={styles.buttonText}>Reset Password</ZIPText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: 'gray',
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeIcon: {
    marginLeft: 8,
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

export default ForgotPasswordForm;
