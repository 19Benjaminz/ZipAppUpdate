import React, { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';
import { store } from './store';
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
import { Wallet, Recharge, Statement, TransactionHistory, CreditCards } from './Profile/Wallet/index';
import SubToAPT from './Zippora/SubToAPT';
import ZipporaInfo from './Zippora/ZipporaInfo';
import ZipLogs from './Zippora/ZipLogs';
import { useColorScheme } from '@/hooks/useColorScheme';
// @ts-ignore
import messaging from 'expo-firebase-messaging';
import * as SecureStore from 'expo-secure-store';
import { Alert, View } from 'react-native';
import * as Notifications from "expo-notifications";

const Stack = createNativeStackNavigator();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [appReady, setAppReady] = useState(false);
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
    const setupNotifications = async () => {
      try {
        // 1. Request permission (this also registers the device with APNs/FCM)
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          console.log('Notification permissions denied');
          return;
        }

        // 2. Get the Expo push token (this is what you send to your server)
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log('Expo Push Token:', token);

        // 3. Store it securely (same key you used before)
        await SecureStore.setItemAsync('zipcodexpress-device-token', token);

        // 4. Listen to foreground messages
        const foregroundSubscription = messaging().onMessage(async (remoteMessage) => {
          console.log('Foreground FCM message:', remoteMessage);

          await Notifications.scheduleNotificationAsync({
            content: {
              title: remoteMessage.notification?.title || 'New Message',
              body: remoteMessage.notification?.body || 'You have a new notification',
              data: remoteMessage.data || {},
              sound: 'default',
            },
            trigger: null, // show immediately
          });
        });

        // 5. App opened from background
        const backgroundSubscription = messaging().onNotificationOpenedApp((remoteMessage) => {
          console.log('App opened from background by notification:', remoteMessage);
          // Navigate if you want → you already have expo-router
        });

        // 6. App opened from quit state
        const initialNotification = await messaging().getInitialNotification();
        if (initialNotification) {
          console.log('App opened from quit state:', initialNotification);
          // Navigate if needed
        }

        // Cleanup on unmount
        return () => {
          foregroundSubscription();
          backgroundSubscription();
        };
      } catch (error) {
        console.error('Notification setup failed:', error);
      }
    };

    setupNotifications();
  }, []);

  // Render the app once fonts are loaded
  // Ensure app renders a white screen instead of black
  if (!appReady) {
    return <View style={{ flex: 1, backgroundColor: "#ffffff" }} />;
  }
  
  return (
    <Provider store={store}>
      {/* <NavigationContainer theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}> */}
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack.Navigator initialRouteName="Zippora/ZipporaHome">
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
            options={{ title: 'Modify Password', headerShown: true }}
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
            options={{ title: 'Transaction History', headerShown: true }}
          />
          <Stack.Screen
            name="Profile/Wallet/CreditCards"
            component={CreditCards}
            options={{ title: 'Credit Cards', headerShown: true }}
          />
          <Stack.Screen
            name="Zippora/SubToAPT"
            component={SubToAPT}
            options={{ title: 'Subscribe to Apartment', headerShown: true }}
          />
          <Stack.Screen
            name="Zippora/ZipporaInfo"
            component={ZipporaInfo}
            options={{ title: 'Property Locker Info', headerShown: true }}
          />
          <Stack.Screen
            name="Zippora/ZipLogs"
            component={ZipLogs}
            options={{ title: 'Logs', headerShown: true }}
          />
        </Stack.Navigator>
      </ThemeProvider>
    </Provider>
  );
}
