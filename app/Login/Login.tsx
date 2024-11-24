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
    const [formData, setFormData] = useState({ email: '', phoneNum: '', password: '' });
    const [isEmailLogin, setIsEmailLogin] = useState(true);
    const navigation = useNavigation<LoginScreenNavigationProp>();
    const dispatch = useAppDispatch();
    const { loading = false, error = null } = useAppSelector((state: RootState) => state.auth || {});

    const handleLogin = async () => {
        if ((isEmailLogin && !formData.email) || (!isEmailLogin && !formData.phoneNum) || !formData.password) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }
    
        const credentials = {
            email: isEmailLogin ? formData.email : undefined,
            phoneNum: !isEmailLogin ? formData.phoneNum : undefined,
            password: md5Hash(formData.password),
        };
    
        try {
            const resultAction = await dispatch(login(credentials));
    
            if (login.fulfilled.match(resultAction)) {
                // Extract payload data
                const { accessToken, memberId } = resultAction.payload;

                // Save to Redux store
                dispatch(setAccessToken(accessToken));
                dispatch(setMemberId(memberId));

                // Navigate to Home on successful login
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Zippora/ZipporaHome' }],
                });
            } else if (login.rejected.match(resultAction)) {
                // Show an alert on login failure
                const errorMessage =
                    typeof resultAction.payload === 'string'
                        ? resultAction.payload
                        : 'Please try again.';
                console.log('Login Failed', errorMessage);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
            Alert.alert('Login Failed', 'An unexpected error occurred.');
        }
    };
    

    const navigateToRegister = () => {
        // Navigate to the registration screen
        navigation.navigate('Login/Register');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, isEmailLogin && styles.activeTab]}
                    onPress={() => setIsEmailLogin(true)}
                >
                    <Text style={[styles.tabText, isEmailLogin && styles.activeTabText]}>
                        Login with Email
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, !isEmailLogin && styles.activeTab]}
                    onPress={() => setIsEmailLogin(false)}
                >
                    <Text style={[styles.tabText, !isEmailLogin && styles.activeTabText]}>
                        Login with Phone
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
                {isEmailLogin ? (
                    <TextInput
                        placeholder="Email"
                        onChangeText={(text) => setFormData({ ...formData, email: text })}
                        style={styles.input}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                ) : (
                    <TextInput
                        placeholder="Phone Number"
                        onChangeText={(text) => setFormData({ ...formData, phoneNum: text })}
                        style={styles.input}
                        keyboardType="phone-pad"
                    />
                )}
                <TextInput
                    placeholder="Password"
                    secureTextEntry
                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                    style={styles.input}
                />

                {error && <Text style={styles.errorText}>{error}</Text>}

                <TouchableOpacity onPress={navigateToRegister} style={styles.registerContainer}>
                    <Text style={styles.registerText}>
                        Not registered? <Text style={styles.clickHere}>Click here</Text>
                    </Text>
                </TouchableOpacity>

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
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: 'white' },
    tabContainer: { flexDirection: 'row', marginBottom: 16 },
    tab: { flex: 1, padding: 12, alignItems: 'center', borderBottomWidth: 2, borderColor: 'gray' },
    activeTab: { borderColor: 'green' },
    tabText: { fontSize: 16, color: 'gray' },
    activeTabText: { color: 'green', fontWeight: 'bold' },
    formContainer: { paddingTop: 20 },
    input: { borderBottomWidth: 1, marginBottom: 16, borderColor: 'gray', padding: 10 },
    registerContainer: { alignItems: 'center', marginBottom: 16 },
    registerText: { color: 'gray', fontSize: 14 },
    clickHere: { color: 'blue', textDecorationLine: 'underline' },
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
});

export default Login;
