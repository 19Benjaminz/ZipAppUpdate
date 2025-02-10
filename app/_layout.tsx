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
import SubToAPT from './Zippora/SubToAPT';
import ZipporaInfo from './Zippora/ZipporaInfo';
import ZipLogs from './Zippora/ZipLogs';
import { useColorScheme } from '@/hooks/useColorScheme';
import messaging from '@react-native-firebase/messaging';
import * as SecureStore from 'expo-secure-store';
import { Alert, View } from 'react-native';

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
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay

        setAppReady(true);

        if (appReady) {
          //await SplashScreen.hideAsync();
        }
      } catch (error) {
        console.error("Error loading app:", error);
      }
    };

    prepareApp();
  }, [fontsLoaded]);

  // Firebase setup for FCM token and notifications
  useEffect(() => {
    const setupFirebase = async () => {
      console.log("Setting up Firebase...");

      try {
        // Request notification permissions
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        console.log("Notification permission status:", enabled);

        if (enabled) {
          // Retrieve FCM token
          const token = await messaging().getToken();
          console.log("FCM Token:", token);

          // Store the FCM token securely
          await SecureStore.setItemAsync('zipcodexpress-device-token', token);

          // Handle foreground notifications
          messaging().onMessage(async (remoteMessage) => {
            Alert.alert(
              'New Notification',
              JSON.stringify(remoteMessage.notification)
            );
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
        } else {
          console.log("Notification permissions denied.");
        }
      } catch (error) {
        console.error("Error in Firebase setup:", error);
      }
    };

    setupFirebase();
  }, []);

  // Render the app once fonts are loaded
  // Ensure app renders a white screen instead of black
  if (!appReady) {
    return <View style={{ flex: 1, backgroundColor: "#ffffff" }} />;
  }
  console.log("App Ready State:", appReady);
  console.log("Fonts Loaded:", fontsLoaded);

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
