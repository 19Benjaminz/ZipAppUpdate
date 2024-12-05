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

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNum, setPhoneNum] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useAppDispatch();

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const sendVcodeAction = async () => {
    try {
      const result = await dispatch(sendRegisterVcode(email)).unwrap();
      console.log("Verification code sent successfully!", result);
    } catch (error) {
      console.error("Failed to send verification code:", error);
    }
  };
  
  const handleSignUp = async () => {
    console.log("Registering with email...");
    if (email) {
      console.log(email);
      await sendVcodeAction();
    }
    navigation.navigate("Login/RegistrationVerificationPage", {
      email,
      phoneNum,
      firstName,
      lastName,
      psd1: password,
      psd2: confirmPassword,
    });
  };
  
  

  const signInButtonColor = () => {
    return firstName && lastName && email && phoneNum && password && confirmPassword
      ? 'rgba(42,187,103,1)'
      : 'rgba(42,187,103,0.5)';
  };

  const signInTextColor = () => {
    return firstName && lastName && email && phoneNum && password && confirmPassword
      ? 'white'
      : 'rgba(255,255,255,0.3)';
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
        <Animatable.View style={{ height: 250 }}>
          <CommonTextInput
            leftTitle="Email"
            placeholder="Enter E-mail address"
            placeholderTextColor="lightgray"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            keyboardType="email-address"
            onChangeText={setEmail}
          />

          {/* Phone Number Field */}
          <CommonTextInput
            leftTitle="Phone Number"
            placeholder="Enter Phone Number"
            placeholderTextColor="lightgray"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="phone-pad"
            value={phoneNum}
            onChangeText={(text) => setPhoneNum(text.replace(/[^0-9]/g, ''))}
          />

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
            onChangeText={setPassword}
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
            onChangeText={setConfirmPassword}
          />
        </Animatable.View>

        <TouchableOpacity
          style={{
            height: 50,
            backgroundColor: signInButtonColor(),
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 3,
            marginTop: 16,
          }}
          activeOpacity={1}
          onPress={handleSignUp}
        >
          <ZIPText style={{ fontSize: 18, color: signInTextColor() }}>Sign Up</ZIPText>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default Register;
