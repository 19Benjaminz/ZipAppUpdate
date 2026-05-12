import React, { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';
import { store } from '@/store';
import Login from './Login/Login';
import Register from './Login/Register';
import RegistrationVerificationPage from './Login/RegistrationVerificationPage';
import ForgotPasswordEmail from './Login/ForgotPasswordEmail';
import ForgotPasswordForm from './Login/ForgotPasswordForm';
import MainTabs from './MainTabs';
import AboutUs from './Profile/AboutUs';
import ModifyAddress from './Profile/ModifyAddress';
import PersonalInfo from './Profile/PersonalInfo';
import ModifyPassword from './Profile/ModifyPassword';
import Wallet from './Profile/Wallet/Wallet';
import Recharge from './Profile/Wallet/Recharge';
import Statement from './Profile/Wallet/Statement';
import TransactionHistory from './Profile/Wallet/TransactionHistory';
import PaymentMethod from './Profile/Wallet/PaymentMethod';
import SubToAPT from './Zippora/SubToAPT';
import ZipporaInfo from './Zippora/ZipporaInfo';
import ZipLogs from './Zippora/ZipLogs';
import { useColorScheme } from '@/hooks/useColorScheme';
import messaging from '@react-native-firebase/messaging';
import { secureStore } from '@/services/secureStore';
import { Alert, Platform, View } from 'react-native';
import * as Notifications from "expo-notifications";
import { setNeedLoginHandler } from './config/apiClient';
import { setAccessToken, setMemberId } from './features/userInfoSlice';
import { useAppSelector } from '@/store';

const Stack = createNativeStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function AppNavigator() {
  const { accessToken, memberId } = useAppSelector((state) => state.userInfo);
  const isLoggedIn = Boolean(accessToken && memberId);

  return (
    <Stack.Navigator key={isLoggedIn ? 'authenticated' : 'guest'}>
      {isLoggedIn ? (
        <>
          <Stack.Screen
            name="Zippora/ZipporaHome"
            component={MainTabs}
            options={{ title: 'Home', headerShown: true, headerLeft: () => null }}
          />
          <Stack.Screen
            name="Profile/AboutUs"
            component={AboutUs}
            options={{ title: 'About Us', headerShown: true }}
          />
          <Stack.Screen
            name="Profile/PersonalInfo"
            component={PersonalInfo}
            options={{ title: 'Personal Information', headerShown: true }}
          />
          <Stack.Screen
            name="Profile/ModifyAddress"
            component={ModifyAddress}
            options={{ title: 'Modify Address', headerShown: true }}
          />
          <Stack.Screen
            name="Profile/ModifyPassword"
            component={ModifyPassword}
            options={{ title: 'Change Password', headerShown: true }}
          />
          <Stack.Screen
            name="Profile/Wallet"
            component={Wallet}
            options={{ title: 'Wallet', headerShown: true }}
          />
          <Stack.Screen
            name="Profile/Wallet/Recharge"
            component={Recharge}
            options={{ title: 'Recharge', headerShown: true }}
          />
          <Stack.Screen
            name="Profile/Wallet/Statement"
            component={Statement}
            options={{ title: 'Statement', headerShown: true }}
          />
          <Stack.Screen
            name="Profile/Wallet/TransactionHistory"
            component={TransactionHistory}
            options={{ title: 'Transactions', headerShown: true }}
          />
          <Stack.Screen
            name="Profile/Wallet/PaymentMethod"
            component={PaymentMethod}
            options={{ title: 'Payment Method', headerShown: true }}
          />
          <Stack.Screen
            name="Zippora/SubToAPT"
            component={SubToAPT}
            options={{ title: 'Subscribe to Apartment', headerShown: true }}
          />
          <Stack.Screen
            name="Zippora/ZipporaInfo"
            component={ZipporaInfo}
            options={{ title: 'Zippora Info', headerShown: true }}
          />
          <Stack.Screen
            name="Zippora/ZipLogs"
            component={ZipLogs}
            options={{ title: 'Zip Logs', headerShown: true }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Login/Login"
            component={Login}
            options={{ title: 'Login', headerShown: true, headerLeft: () => null }}
          />
          <Stack.Screen
            name="Login/Register"
            component={Register}
            options={{ title: 'Register', headerShown: true }}
          />
          <Stack.Screen
            name="Login/RegistrationVerificationPage"
            component={RegistrationVerificationPage}
            options={{ title: 'Verification', headerShown: true }}
          />
          <Stack.Screen
            name="Login/ForgotPasswordEmail"
            component={ForgotPasswordEmail}
            options={{ title: 'Forgot Password', headerShown: true }}
          />
          <Stack.Screen
            name="Login/ForgotPasswordForm"
            component={ForgotPasswordForm}
            options={{ title: 'Forgot Password', headerShown: true }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [appReady, setAppReady] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    const prepareSplashScreen = async () => {
      console.log("Splash Screen Prevent Auto-Hide Running...");
      await SplashScreen.preventAutoHideAsync();
    };
  
    prepareSplashScreen();
  }, []);

  // Hide the splash screen once fonts are loaded
  useEffect(() => {
    const prepareApp = async () => {
      try {
        //await SplashScreen.preventAutoHideAsync(); 
        // Wait for fonts to load
        if (!fontsLoaded) return;

        // Simulate additional app setup (e.g., Firebase, API calls)
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay

        setAppReady(true);

        if (appReady) {
          await SplashScreen.hideAsync();
        }
      } catch (error) {
        console.error("Error loading app:", error);
      }
    };

    prepareApp();
  }, [fontsLoaded, appReady]);

  // Firebase setup for FCM token and notifications
  useEffect(() => {
    const setupFirebase = async () => {
      try {
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#2ABB67',
          });

          const notificationPermission = await Notifications.getPermissionsAsync();
          if (notificationPermission.status !== 'granted') {
            await Notifications.requestPermissionsAsync();
          }
        }

        if (Platform.OS === 'ios') {
          const notificationPermission = await Notifications.getPermissionsAsync();
          if (notificationPermission.status !== 'granted') {
            await Notifications.requestPermissionsAsync();
          }
        }

        const authStatus = Platform.OS === 'ios'
          ? await messaging().requestPermission()
          : messaging.AuthorizationStatus.AUTHORIZED;

        console.log('[FCM] Authorization status:', authStatus);

        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          await messaging().registerDeviceForRemoteMessages();

          // Retrieve FCM token
          const token = await messaging().getToken();
          console.log('[FCM] Registration token:', token ?? 'missing');

          if (Platform.OS === 'ios') {
            const apnsToken = await messaging().getAPNSToken();
            console.log('[FCM] APNs token:', apnsToken ?? 'missing');
          }

          // Store the FCM token securely
          await secureStore.setItemAsync('zipcodexpress-device-token', token);

          // Handle foreground notifications
          messaging().onMessage(async (remoteMessage) => {
            console.log("Foreground Notification:", remoteMessage);

            // Show local notification when receiving FCM while in foreground
            await Notifications.scheduleNotificationAsync({
              content: {
                title: remoteMessage.notification?.title ?? "New Notification",
                body: remoteMessage.notification?.body ?? "You have a new message",
                data: remoteMessage.data, // Pass custom data if needed
                sound: true,
                ...(Platform.OS === 'android' ? { channelId: 'default' } : {}),
              },
              trigger: null, // Immediately show the notification
            });
          });

          // Handle notifications opened from the background
          messaging().onNotificationOpenedApp((remoteMessage) => {
            console.log(
              'Notification caused app to open:',
              remoteMessage.notification
            );
          });

          // Handle notifications when the app is opened from a terminated state
          const initialNotification = await messaging().getInitialNotification();
          if (initialNotification) {
            console.log(
              'App opened from quit state due to notification:',
              initialNotification.notification
            );
          }

          const unsubscribeTokenRefresh = messaging().onTokenRefresh(async (nextToken) => {
            console.log('[FCM] Refreshed registration token:', nextToken ?? 'missing');
            await secureStore.setItemAsync('zipcodexpress-device-token', nextToken);
          });

          return unsubscribeTokenRefresh;
        } else {
          console.log("Notification permissions denied.");
        }
      } catch (error) {
        console.error("Error in Firebase setup:", error);
      }
    };

    let unsubscribeTokenRefresh: undefined | (() => void);

    setupFirebase().then((unsubscribe) => {
      unsubscribeTokenRefresh = unsubscribe;
    });

    return () => {
      unsubscribeTokenRefresh?.();
    };
  }, []);

  useEffect(() => {
    const hydrateAuth = async () => {
      const storedAccessToken = (await secureStore.getItemAsync('accessToken')) || '';
      const storedMemberId = (await secureStore.getItemAsync('memberId')) || '';

      store.dispatch(setAccessToken(storedAccessToken));
      store.dispatch(setMemberId(storedMemberId));
      setAuthReady(true);
    };

    hydrateAuth();
  }, []);

  useEffect(() => {
    setNeedLoginHandler(() => {
      secureStore.deleteItemAsync('accessToken');
      secureStore.deleteItemAsync('memberId');
      store.dispatch(setAccessToken(''));
      store.dispatch(setMemberId(''));
    });

    return () => {
      setNeedLoginHandler(null);
    };
  }, []);

  // Render the app once fonts are loaded
  // Ensure app renders a white screen instead of black
  if (!appReady || !authReady) {
    return <View style={{ flex: 1, backgroundColor: "#ffffff" }} />;
  }
  
  return (
    <Provider store={store}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AppNavigator />
      </ThemeProvider>
    </Provider>
  );
}
