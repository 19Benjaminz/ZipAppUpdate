import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/core';
import { RootStackParamList } from '../../components/types';
import { useAppDispatch } from '../store';
import { register } from '../features/authSlice';
import { setAccessToken, setMemberId } from '../features/userInfoSlice';

type VerificationPageRouteProp = RouteProp<RootStackParamList, 'Login/RegistrationVerificationPage'>;

const RegistrationVerificationPage = () => {
  const [verificationCode, setVerificationCode] = useState(''); // State for verification code
  const route = useRoute<VerificationPageRouteProp>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  // Destructure the route params
  const { phoneNum, email, firstName, lastName, psd1, psd2 } = route.params;

  const registerAction = async () => {
    const credentials = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      vcode: verificationCode,
      phone: phoneNum,
      psd1: psd1,
      psd2: psd2,
    };
  
    if (
      phoneNum &&
      email &&
      firstName &&
      lastName &&
      psd1 &&
      psd2 &&
      psd1 === psd2 &&
      verificationCode
    ) {
      try {
        const resultAction = await dispatch(register(credentials));
        if (register.fulfilled.match(resultAction)) {
          const { ret, msg, data } = resultAction.payload;
  
          // Handle specific cases based on 'ret'
          switch (ret) {
            case 0: // Registration success
                console.log("Registration successful!");

                dispatch(setAccessToken(data.accessToken));
                dispatch(setMemberId(data.memberId));

                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Zippora/ZipporaHome' }],
            });
              break;
            case 3: // Email already registered
              console.error("Error: Email has been registered.");
              Alert.alert("Error", "Email has already been registered.");
              break;
            case 7: // Wrong verification code
              console.error("Error: Wrong verification code.");
              Alert.alert("Error", "The verification code is incorrect.");
              break;
            case 8: // Phone already registered
              console.error("Error: Phone has been registered.");
              Alert.alert("Error", "This phone number is already registered.");
              break;
            default:
              console.error("Unhandled case:", msg);
              Alert.alert("Error", msg || "Unexpected error occurred.");
          }
        }
      } catch (error) {
        console.error("Registration failed:", error);
        Alert.alert("Error", "An unexpected error occurred. Please try again.");
      }
    } else {
      console.error("Missing or invalid fields.");
      Alert.alert("Error", "Please fill in all fields correctly.");
    }
  };
  

  const handleRegister = () => {
    if (!verificationCode) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    registerAction()
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Verify Your Email</Text>
      <Text style={styles.details}>
        Please enter the verification code sent to your email: {email}
      </Text>
      {phoneNum && (
        <Text style={styles.details}>Phone Number: {phoneNum}</Text>
      )}

      {/* Verification Code Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter Verification Code"
        placeholderTextColor="gray"
        keyboardType="numeric"
        value={verificationCode}
        onChangeText={setVerificationCode}
      />

      <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
        <Text style={styles.registerButtonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  details: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    width: '80%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 8,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  registerButton: {
    backgroundColor: '#2ABB67',
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RegistrationVerificationPage;
