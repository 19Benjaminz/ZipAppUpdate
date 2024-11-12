import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Keyboard,
  StatusBar,
  Text,
} from 'react-native';
import ZIPText from '@/components/ZIPText';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as Animatable from 'react-native-animatable';
import CommonTextInput from '@/components/CommonTextInput';

const Register = () => {
  const [useEmail, setUseEmail] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNum, setPhoneNum] = useState('');
  const [vCode, setVCode] = useState('');
  const [showCount, setShowCount] = useState(false);
  const [count, setCount] = useState(59);
  const [canSendVCode, setCanSendVCode] = useState(true);

  const emailView = useRef(null);
  const phoneView = useRef(null);
  let interval: NodeJS.Timeout;

  useEffect(() => {
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const signInButtonColor = () => {
    if (useEmail) {
      return firstName && lastName && email && password && confirmPassword ? 'rgba(42,187,103,1)' : 'rgba(42,187,103,0.5)';
    } else {
      return firstName && lastName && phoneNum && vCode ? 'rgba(42,187,103,1)' : 'rgba(42,187,103,0.5)';
    }
  };

  const signInTextColor = () => {
    if (useEmail) {
      return firstName && lastName && email && password && confirmPassword ? 'white' : 'rgba(255,255,255,0.3)';
    } else {
      return firstName && lastName && phoneNum && vCode ? 'white' : 'rgba(255,255,255,0.3)';
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar barStyle="light-content" animated />
      
      {/* Tabs for Email and Phone Registration */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 16 }}>
        <TouchableOpacity
          onPress={() => setUseEmail(true)}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderBottomWidth: 2,
            borderBottomColor: useEmail ? '#2ABB67' : 'lightgray',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: useEmail ? '#2ABB67' : 'gray', fontWeight: useEmail ? 'bold' : 'normal' }}>
            Register with Email
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setUseEmail(false)}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderBottomWidth: 2,
            borderBottomColor: !useEmail ? '#2ABB67' : 'lightgray',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: !useEmail ? '#2ABB67' : 'gray', fontWeight: !useEmail ? 'bold' : 'normal' }}>
            Register with Phone Number
          </Text>
        </TouchableOpacity>
      </View>

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

        {useEmail ? (
          <Animatable.View ref={emailView} style={{ height: 150 }}>
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
            <CommonTextInput
              leftTitle="Password"
              placeholder="Enter Password"
              placeholderTextColor="lightgray"
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <CommonTextInput
              leftTitle="Confirm"
              placeholder="Confirm Password"
              placeholderTextColor="lightgray"
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </Animatable.View>
        ) : (
          <Animatable.View ref={phoneView} style={{ height: 100 }}>
            <CommonTextInput
              leftTitle="Phone"
              placeholder="Enter mobile number"
              placeholderTextColor="lightgray"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="numeric"
              value={phoneNum}
              onChangeText={(text) => setPhoneNum(text.replace(/[^0-9]/g, ''))}
            />
            <CommonTextInput
              leftTitle="SMS Code"
              rightTitle={showCount ? `Resend after ${count}s` : 'Send'}
              onRightClick={() => canSendVCode}
              placeholder="Enter verification code"
              placeholderTextColor="lightgray"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="numeric"
              value={vCode}
              onChangeText={(text) => setVCode(text.replace(/[^0-9]/g, ''))}
            />
          </Animatable.View>
        )}
        
        <ZIPText
          style={{ color: '#2ABB67', marginTop: 8, marginLeft: 8, fontSize: 16 }}
          onPress={() => setUseEmail(!useEmail)}
        >
          Use {useEmail ? 'Mobile number' : 'Email'} to register
        </ZIPText>

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
        >
          <ZIPText style={{ fontSize: 18, color: signInTextColor() }}>Sign Up</ZIPText>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default Register;
