import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { enableScreens } from 'react-native-screens';
import 'react-native-reanimated';
import HomeScreen from "./(tabs)/index";
import ZipporaHome from './Zippora/ZipporaHome';
import Login from './Login/Login';
import Register from './Login/Register';
import AddAddress from './AddAddress';

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
        {/* <Stack.Screen name="Login/AddAddress" component={AddAddress} /> */}
        {/* <Stack.Screen name="Zippora/ZipporaHome" component={ZipporaHome} /> */}
        {/* <Stack.Screen name="+not-found" component={HomeScreen} /> */}
      </Stack.Navigator>
    </ThemeProvider>
  );
}
