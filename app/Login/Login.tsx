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
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  useColorScheme,
  ScrollView,
} from 'react-native';
import { md5Hash } from '@/Actions/ToMD5';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../components/types';
import { login } from '../features/authSlice';
import { setAccessToken, setMemberId } from '../features/userInfoSlice';
import { RootState, useAppDispatch, useAppSelector } from '@/store';
import { getCurrentDeviceToken } from '@/services/deviceToken';
import { secureStore } from '@/services/secureStore';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login/Login'>;

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const { loading = false, error = null } = useAppSelector((state: RootState) => state.auth || {});
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const placeholderColor = isDark ? '#9CA3AF' : '#888';
  const inputTextColor = isDark ? '#111' : '#111'; // keep same dark text color for consistency on light bg
  const borderColor = isDark ? '#555' : 'gray';
  const bgColor = 'white'; // always keep light background, ignore dark mode for page background

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const deviceId = await getCurrentDeviceToken();
    const credentials = {
      email: formData.email,
      password: md5Hash(formData.password),
      ...(deviceId && { deviceId }),
    };

    if (__DEV__) {
      console.log('[auth/login] deviceId used for login:', deviceId ?? 'missing');
    }

    try {
      const resultAction = await dispatch(login(credentials));

      if (login.fulfilled.match(resultAction)) {
        const payload: any = resultAction.payload;
        const rawAccessToken = payload?.accessToken ?? payload?._accessToken ?? payload?.token;
        const rawMemberId = payload?.memberId ?? payload?._memberId ?? payload?.member?.memberId;
        const accessToken = rawAccessToken != null ? String(rawAccessToken) : '';
        const memberId = rawMemberId != null ? String(rawMemberId) : '';

        if (!accessToken || !memberId) {
          Alert.alert('Login Failed', 'Login response is missing credentials. Please try again.');
          return;
        }

        await secureStore.setItemAsync('accessToken', accessToken);
        await secureStore.setItemAsync('memberId', memberId);

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
        // Alert.alert('Login Failed', errorMessage);
      }
    } catch (err: any) {
      console.error('Unexpected error:', err);
      const errorMessage =
        err.response?.data?.message || err.message || 'Unexpected error occurred';
      // Alert.alert('Login Failed', errorMessage);
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Login/Register');
  };

  const navigateToForgotPassword = () => {
    navigation.navigate('Login/ForgotPasswordEmail');
  };

  // Handle keyboard dismissal on return key press
  const handleSubmitEditing = () => {
    Keyboard.dismiss();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: bgColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.innerContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

          <Image
            source={require('../../assets/images/zipLogo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.formContainer}>
            <TextInput
              placeholder="Email"
              placeholderTextColor={placeholderColor}
              value={formData.email}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, email: text }))}
              style={[styles.input, { borderColor, color: inputTextColor }]}
              keyboardType="email-address"
              textContentType="username"
              autoComplete="username"
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleSubmitEditing}
            />

            <TextInput
              placeholder="Password"
              placeholderTextColor={placeholderColor}
              secureTextEntry
              onChangeText={(text) => setFormData((prev) => ({ ...prev, password: text }))}
              style={[styles.input, { borderColor, color: inputTextColor }]}
              textContentType="password"
              autoComplete="password"
              value={formData.password}
              returnKeyType="done"
              onSubmitEditing={handleSubmitEditing}
            />

            {error && formData.email && formData.password && (
              <Text style={styles.errorText}>{error}</Text>
            )}

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

            <TouchableOpacity
              onPress={navigateToForgotPassword}
              style={styles.forgotPasswordContainer}
            >
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  innerContainer: { flex: 1, padding: 16 },
  logo: {
    width: '50%',
    height: '15%',
    alignSelf: 'center',
    marginBottom: 5,
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
  loginText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
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