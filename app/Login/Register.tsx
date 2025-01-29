import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StatusBar,
  Text,
} from 'react-native';
import ZIPText from '@/components/ZIPText';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as Animatable from 'react-native-animatable';
import CommonTextInput from '@/components/CommonTextInput';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/core';
import { RootStackParamList } from '../../components/types';
import { useAppDispatch } from '../store';
import { sendRegisterVcode } from '../features/authSlice';
import { capitalizeFirstLetter, formatPhoneNumber } from '../Actions/Utils';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneNum, setPhoneNum] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const validateEmailFormat = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailValidation = () => {
    if (!validateEmailFormat(email)) {
      setEmailError('The email format is incorrect.');
    } else {
      setEmailError('');
    }
  };

  const handlePasswordValidation = () => {
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.');
    } else {
      setPasswordError('');
    }
  };
  
  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^[0-9]{10}$/; // Example: 10 digits
    return phoneRegex.test(phone);
  };
  
  const handlePhoneValidation = () => {
    if (!validatePhoneNumber(phoneNum)) {
      setPhoneError('The phone number format is incorrect.');
    } else {
      setPhoneError('');
    }
  };

  const handleSignUp = async () => {
    console.log('Registering with email...');
    if (email) {
      await sendVcodeAction();
    }

    const standardizedFirstName = capitalizeFirstLetter(firstName);
    const standardizedLastName = capitalizeFirstLetter(lastName);
    const formattedPhone = formatPhoneNumber(phoneNum);

    setFirstName(standardizedFirstName);
    setLastName(standardizedLastName);
    setPhoneNum(formattedPhone);

    navigation.navigate('Login/RegistrationVerificationPage', {
      email,
      phoneNum,
      firstName,
      lastName,
      psd1: password,
      psd2: confirmPassword,
    });
  };

  const sendVcodeAction = async () => {
    try {
      setLoading(true);
      const result = await dispatch(sendRegisterVcode(email)).unwrap();
      console.log(result);
      setLoading(false);
    } catch (error) {
      console.error('Failed to send verification code:', error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar barStyle="light-content" animated />

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 8 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* First Name and Last Name Fields */}
        <CommonTextInput
          leftTitle="First Name"
          placeholder="Enter First Name"
          placeholderTextColor="lightgray"
          autoCapitalize="words"
          autoCorrect={false}
          value={firstName}
          onChangeText={setFirstName}
        />
        <CommonTextInput
          leftTitle="Last Name"
          placeholder="Enter Last Name"
          placeholderTextColor="lightgray"
          autoCapitalize="words"
          autoCorrect={false}
          value={lastName}
          onChangeText={setLastName}
        />

        {/* Email Field */}
        <CommonTextInput
          leftTitle="Email"
          placeholder="Enter E-mail address"
          placeholderTextColor="lightgray"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          keyboardType="email-address"
          onChangeText={(text) => {
            setEmail(text);
            if (emailError) handleEmailValidation();
          }}
          onEndEditing={handleEmailValidation}
          isError={!!emailError} // Pass error state
        />
        {emailError ? (
          <Text style={{ color: 'red', marginTop: 4, marginLeft: 8 }}>{emailError}</Text>
        ) : null}

        {/* Phone Number Field */}
        <CommonTextInput
          leftTitle="Phone Number"
          placeholder="Enter Phone Number"
          placeholderTextColor="lightgray"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="phone-pad"
          value={phoneNum}
          onChangeText={(text) => {
            setPhoneNum(text.replace(/[^0-9]/g, '')); // Allow only numbers
            if (phoneError) handlePhoneValidation(); // Revalidate if there's an error
          }}
          onEndEditing={handlePhoneValidation} // Validate on blur
          isError={!!phoneError} // Highlight the field if there's an error
        />
        {phoneError ? (
          <Text style={{ color: 'red', marginTop: 4, marginLeft: 8 }}>{phoneError}</Text>
        ) : null}

        {/* Password Fields */}
        <CommonTextInput
          leftTitle="Password"
          placeholder="Enter Password"
          placeholderTextColor="lightgray"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={!showPassword}
          rightTitle={showPassword ? 'Hide' : 'Show'}
          onRightClick={() => setShowPassword(!showPassword)}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (passwordError) handlePasswordValidation();
          }}
          onEndEditing={handlePasswordValidation}
          textContentType="none"
          autoComplete="off"
        />

        <CommonTextInput
          leftTitle="Confirm Password"
          placeholder="Confirm Password"
          placeholderTextColor="lightgray"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={!showConfirmPassword}
          rightTitle={showConfirmPassword ? 'Hide' : 'Show'}
          onRightClick={() => setShowConfirmPassword(!showConfirmPassword)}
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (passwordError) handlePasswordValidation();
          }}
          onEndEditing={handlePasswordValidation}
          textContentType="none"
          autoComplete="off"
          isError={!!passwordError} // Highlight Confirm Password field if passwords don't match
        />
        {passwordError ? (
          <Text style={{ color: 'red', marginTop: 4 }}>{passwordError}</Text>
        ) : null}

        {/* Sign Up Button */}
        <TouchableOpacity
          style={{
            height: 50,
            backgroundColor:
              loading ||
              !firstName ||
              !lastName ||
              !email ||
              !phoneNum ||
              !password ||
              !confirmPassword ||
              emailError ||
              passwordError
                ? 'rgba(42,187,103,0.5)' // Disabled color
                : 'rgba(42,187,103,1)', // Active color
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 3,
            marginTop: 16,
          }}
          activeOpacity={loading ? 1 : 0.7}
          onPress={handleSignUp}
          disabled={
            loading ||
            !firstName ||
            !lastName ||
            !email ||
            !phoneNum ||
            !password ||
            !confirmPassword ||
            !!emailError ||
            !!passwordError
          }
        >
          <ZIPText
            style={{
              fontSize: 18,
              color:
                loading ||
                !firstName ||
                !lastName ||
                !email ||
                !phoneNum ||
                !password ||
                !confirmPassword ||
                emailError ||
                passwordError
                  ? 'rgba(255,255,255,0.3)' // Disabled text color
                  : 'white', // Active text color
            }}
          >
            Sign Up
          </ZIPText>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default Register;
