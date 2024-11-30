import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { enableScreens } from 'react-native-screens';
import { store } from './store';
import 'react-native-reanimated';
import Login from './Login/Login';
import Register from './Login/Register'
import VerificationPage from './Login/VerificationPage';
import MainTabs from './MainTabs';
import AboutUs from './Profile/AboutUs';
import ModifyAddress from './Profile/ModifyAddress';
import PersonalInfo from './Profile/PersonalInfo';
import SubToAPT from './Zippora/SubToAPT';
import ZipporaInfo from './Zippora/ZipporaInfo';

import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

enableScreens();

const linking = {
  prefixes: ['yourapp://'], // Your app’s URL scheme
  config: {
    screens: {
      Login: 'Login/Login', // Map 'Login' to 'Login/Login'
      Register: 'Register/Register', // Map 'Register' to 'Register/Register'
      // Add other screens as needed
    },
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme} >
        <Stack.Navigator>
          {/* <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" /> */}
          <Stack.Screen
              name="Login/Login"
              component={Login}
              options={{ title: 'Login', headerShown: true }}
            />
          <Stack.Screen
              name="Login/Register"
              component={Register}
              options={{ title: 'Register', headerShown: true }}
          />
          <Stack.Screen
              name="Login/VerificationPage"
              component={VerificationPage}
              options={{ title: 'Verification', headerShown: true }}
          />
          <Stack.Screen 
              name="Zippora/ZipporaHome"
              component={MainTabs}
              options={{ title: 'Home', headerShown: true,  headerLeft: () => null }}
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
            name="Zippora/SubToAPT"
            component={SubToAPT}
            options={{ title: 'Subscribe to Apartment', headerShown: true }}
          />
          <Stack.Screen
            name="Zippora/ZipporaInfo"
            component={ZipporaInfo}
            options={{ title: 'Property Locker Info', headerShown: true }}
          />
          {/* <Stack.Screen name="Login/AddAddress" component={AddAddress} /> */}
          {/* <Stack.Screen name="+not-found" component={HomeScreen} /> */}
        </Stack.Navigator>
      </ThemeProvider>
    </Provider>
    
  );
}
