import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/core';
import { RootStackParamList } from '../../components/types';
import { useAppDispatch } from '../store';
import { register } from '../features/authSlice';
import { setAccessToken, setMemberId } from '../features/userInfoSlice';

type VerificationPageRouteProp = RouteProp<RootStackParamList, 'Login/RegistrationVerificationPage'>;

const RegistrationVerificationPage = () => {
  const [verificationCode, setVerificationCode] = useState(''); // State for verification code
  const [inputError, setInputError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
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
        console.log("Registration result:", resultAction);
        if (register.fulfilled.match(resultAction)) {
          const payload = resultAction.payload as any;
          console.log("Registration response payload:", payload);

          // Handle specific cases based on payload.ret
          switch (payload.ret) {
            case 0: // Registration success
              console.log("Registration successful!");
              Alert.alert("Success", "Registration successful!");
              setTimeout(() => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login/Login' }],
                });
              }, 1000);
              break;
            case 3: // Email already registered
              console.error("Error: Email has been registered.");
              Alert.alert("Error", "Email has already been registered.");
              navigation.goBack();
              break;
            case 7: // Wrong verification code
              console.error("Error: Wrong verification code.");
              setInputError(true);
              setErrorMessage("Wrong verification code. Please try again.");
              break;
            case 8: // Phone already registered
              console.error("Error: Phone has been registered.");
              Alert.alert("Error", "This phone number is already registered.");
              navigation.goBack();
              break;
            default:
              console.error("Unhandled case. Payload:", payload);
              Alert.alert("Error", payload.msg || "Unexpected error occurred.");
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

    setInputError(false); // Reset input error state
    setErrorMessage('');
    registerAction();
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <Text style={styles.header}>Verify Your Email</Text>
            <Text style={styles.details}>
              Please enter the verification code sent to your email: {email}
            </Text>
            {phoneNum && <Text style={styles.details}>Phone Number: {phoneNum}</Text>}

            <TextInput
              style={[
                styles.input,
                inputError ? { borderColor: 'red', backgroundColor: '#ffe6e6' } : {},
              ]}
              placeholder="Enter Verification Code"
              placeholderTextColor="gray"
              keyboardType="numeric"
              value={verificationCode}
              onChangeText={text => setVerificationCode(text.trim())}
              returnKeyType="done"
              onSubmitEditing={handleRegister}
              blurOnSubmit
            />
            {inputError && <Text style={styles.errorText}>{errorMessage}</Text>}

            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
              <Text style={styles.registerButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 24,
  },
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
    marginBottom: 8,
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
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 8,
  },
});

export default RegistrationVerificationPage;
