import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
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
import { Alert } from 'react-native';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Hide the splash screen once fonts are loaded
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
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
          console.log("Notification permissions granted.");

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
  if (!fontsLoaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <NavigationContainer theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
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
      </NavigationContainer>
    </Provider>
  );
}
