import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  StyleSheet,
  Text,
  ActivityIndicator,
  Image
} from 'react-native';
import { md5Hash } from '../Actions/ToMD5';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../components/types';
import { login } from '../features/authSlice';
import { setAccessToken, setMemberId } from '../features/userInfoSlice';
import { RootState, useAppDispatch, useAppSelector } from '../store';
import * as SecureStore from 'expo-secure-store';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login/Login'>;

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const { loading = false, error = null } = useAppSelector((state: RootState) => state.auth || {});

  const handleLogin = async () => {
    console.log("clicking loging")
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const deviceId = await SecureStore.getItemAsync('zipcodexpress-device-token');
    const credentials = {
      email: formData.email,
      password: md5Hash(formData.password),
      ...(deviceId && { deviceId }),
    };

    console.log(credentials)

    try {
      const resultAction = await dispatch(login(credentials));

      if (login.fulfilled.match(resultAction)) {
        const { accessToken, memberId } = resultAction.payload;
        dispatch(setAccessToken(accessToken));
        console.log(accessToken);
        dispatch(setMemberId(memberId));

        navigation.reset({
          index: 0,
          routes: [{ name: 'Zippora/ZipporaHome' }],
        });
      } else if (login.rejected.match(resultAction)) {
        const errorMessage =
          typeof resultAction.payload === 'string'
            ? resultAction.payload
            : 'Please try again.';
        Alert.alert('Login Failed ------ 1', errorMessage);
      }
    } catch (err: any) {
      console.error('Unexpected error:', err);
      const errorMessage =
      err.response?.data?.message || err.message || 'Unexpected error occurred';
      Alert.alert('Login Failed', errorMessage);
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Login/Register');
  };

  const navigateToForgotPassword = () => {
    navigation.navigate('Login/ForgotPasswordEmail');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Image
        source={require('../../assets/images/zipLogo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

    
      <View style={styles.formContainer}>
      <TextInput
        placeholder="Email"
        value={formData.email}
        onChangeText={(text) => { 
          setFormData((prev) => ({ ...prev, email: text }));
        }}
        onEndEditing={(e) => {
          // Finalize the value when editing ends
          const text = e.nativeEvent.text;
          setTimeout(() => {
            setFormData((prev) => ({ ...prev, email: text }));
          }, 0);
        }}
        style={styles.input}
        keyboardType="email-address"
        textContentType="username"
        autoComplete="username"
        autoCapitalize="none"
      />

        <TextInput
          placeholder="Password"
          secureTextEntry
          onChangeText={(text) => setFormData({ ...formData, password: text })}
          style={styles.input}
          textContentType="password"
          autoComplete="password"
          value={formData.password}
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.disabledButton]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.loginText}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={navigateToForgotPassword} style={styles.forgotPasswordContainer}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <View style={styles.separatorContainer}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>OR</Text>
          <View style={styles.separatorLine} />
        </View>

        <TouchableOpacity style={styles.registerButton} onPress={navigateToRegister}>
          <Text style={styles.registerButtonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: 'white' },
  logo: {
    width: '50%', // Adjust width and height as needed
    height: '15%',
    alignSelf: 'center', // Center the logo horizontally
    marginBottom: 5, // Add space between the logo and the form
  },
  formContainer: { paddingTop: 20 },
  input: { borderBottomWidth: 1, marginBottom: 16, borderColor: 'gray', padding: 10 },
  forgotPasswordContainer: { alignItems: 'center', marginVertical: 16 },
  forgotPasswordText: { color: 'blue', fontSize: 14, textDecorationLine: 'underline' },
  loginButton: {
    backgroundColor: 'green',
    padding: 16,
    alignItems: 'center',
    borderRadius: 5,
  },
  disabledButton: {
    backgroundColor: 'gray',
  },
  loginText: { color: 'white', fontSize: 16 },
  errorText: { color: 'red', marginBottom: 16 },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'gray',
  },
  separatorText: {
    marginHorizontal: 8,
    fontSize: 14,
    color: 'gray',
  },
  registerButton: {
    backgroundColor: 'blue',
    padding: 16,
    alignItems: 'center',
    borderRadius: 5,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Login;
