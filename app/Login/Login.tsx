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
} from 'react-native';
import { md5Hash } from '../Actions/ToMD5';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../components/types';
import { login } from '../features/authSlice';
import { setAccessToken, setMemberId } from '../features/userInfoSlice';
import { RootState, useAppDispatch, useAppSelector } from '../store';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login/Login'>;

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const { loading = false, error = null } = useAppSelector((state: RootState) => state.auth || {});

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const credentials = {
      email: formData.email,
      password: md5Hash(formData.password),
    };

    try {
      const resultAction = await dispatch(login(credentials));

      if (login.fulfilled.match(resultAction)) {
        const { accessToken, memberId } = resultAction.payload;
        dispatch(setAccessToken(accessToken));
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
        Alert.alert('Login Failed', errorMessage);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      Alert.alert('Login Failed', 'An unexpected error occurred.');
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
      <View style={styles.formContainer}>
        <TextInput
          placeholder="Email"
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Password"
          secureTextEntry
          onChangeText={(text) => setFormData({ ...formData, password: text })}
          style={styles.input}
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
