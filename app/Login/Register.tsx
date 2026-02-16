import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StatusBar,
  Text,
  Alert
} from 'react-native';
import ZIPText from '@/components/ZIPText';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as Animatable from 'react-native-animatable';
import CommonTextInput from '@/components/CommonTextInput';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/core';
import { RootStackParamList } from '../../components/types';
import { useAppDispatch } from '../store';
import { sendRegisterVcode, checkEmail } from '../features/authSlice';
import { capitalizeFirstLetter, formatPhoneNumber } from '../Actions/Utils';
import LoadingOverlay from '@/components/LoadingOverlay';
import { md5Hash } from '../Actions/ToMD5';

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

  const handlePasswordValidation = (pwd: string = password, confirmPwd: string = confirmPassword) => {
    // Only show error if confirmPassword has content and doesn't match
    if (confirmPwd.length > 0 && pwd !== confirmPwd) {
      setPasswordError('Passwords do not match.');
    } else {
      setPasswordError('');
    }
  };
  
  const formatPhoneNumberInput = (text: string) => {
    // Remove all non-numeric characters
    const cleaned = text.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limited = cleaned.slice(0, 10);
    
    // Format as xxx-xxx-xxxx
    if (limited.length <= 3) {
      return limited;
    } else if (limited.length <= 6) {
      return `${limited.slice(0, 3)}-${limited.slice(3)}`;
    } else {
      return `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(6)}`;
    }
  };
  
  const validatePhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10; // Must be exactly 10 digits
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
    if (!email) return;
    try {
      const checkEmailRet = await checkEmailAction();
      console.log("checkEmail: ", checkEmailRet)
      if (checkEmailRet == 0) {
        await sendVcodeAction();
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
          psd1: md5Hash(password),
          psd2: md5Hash(confirmPassword),
        });
      }
      else {
        Alert.alert(
          "Error", 
          "Email has already been registered. Please Login",
          [
            {
              text: "OK",
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login/Login' }],
                });
              }
            }
          ]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const sendVcodeAction = async () => {
    try {
      setLoading(true);
      const result = await dispatch(sendRegisterVcode(email)).unwrap();
    } catch (error) {
      console.error('Failed to send verification code:', error);
      setLoading(false);
    }
  };

  const checkEmailAction = async () => {
    try {
      setLoading(true)
      const ret = await dispatch(checkEmail(email)).unwrap();
      return ret
    } catch (error) {
      console.error('Failed to check Email', error);
      setLoading(false);
    }
  }

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
          placeholder="123-456-7890"
          placeholderTextColor="lightgray"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="phone-pad"
          value={phoneNum}
          onChangeText={(text) => {
            const formatted = formatPhoneNumberInput(text);
            setPhoneNum(formatted);
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
            // Validate immediately if confirm password has content
            if (confirmPassword.length > 0) {
              handlePasswordValidation(text, confirmPassword);
            }
          }}
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
            // Validate immediately as user types
            handlePasswordValidation(password, text);
          }}
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
      <LoadingOverlay visible={loading} />
    </View>
  );
};

export default Register;
