import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useAppDispatch } from '../store';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '@/components/types';
import { sendForgotPasswordVcode } from '../features/authSlice';

const ForgotPasswordEmail: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');

  const handleGetCode = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }

    try {
      // Simulate API request to send verification code
      const data = await dispatch(sendForgotPasswordVcode(email))
      console.log('in ForgotPasswordEmail: ', data);
      const memberId = data.payload.memberId;
      console.log('Sending verification code to email:', email);
      Alert.alert('Success', 'Verification code sent to your email.');
      if (memberId) {
        navigation.navigate('Login/ForgotPasswordForm', { memberId, email });
      }
    } catch (error) {
      console.error('Error sending verification code:', error);
      Alert.alert('Error', 'Failed to send verification code. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>Enter your email address to get a verification code.</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TouchableOpacity style={styles.button} onPress={handleGetCode}>
        <Text style={styles.buttonText}>Get Code</Text>
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
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 8,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  button: {
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

export default ForgotPasswordEmail;
