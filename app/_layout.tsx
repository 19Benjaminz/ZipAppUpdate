import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider} from 'react-redux';
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

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

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
