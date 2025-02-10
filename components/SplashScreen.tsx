import { useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

// Prevent auto-hiding the splash screen
SplashScreen.preventAutoHideAsync();

export default function SplashScreenComponent({ onLoaded }: { onLoaded: () => void }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadResources = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulating loading time
      setIsReady(true);
      SplashScreen.hideAsync(); // Hide splash screen after loading
      onLoaded();
    };

    loadResources();
  }, []);

  return (
    !isReady ? (
      <View style={styles.container}>
        <Image source={require('../assets/images/SplashScreen_1125x2436.png')} style={styles.image} />
      </View>
    ) : null
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  image: {
    width: '100%',  // Ensures full width
    height: '100%', // Ensures full height
    resizeMode: 'cover',
  },
});
