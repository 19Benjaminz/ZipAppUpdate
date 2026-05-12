import React, { useState, useEffect, useRef } from "react";
import { Alert, StyleSheet, TouchableOpacity, View, Dimensions, Platform } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { MaterialIcons } from "@expo/vector-icons";
import { useAppDispatch } from '@/store';
import Overlay from "@/components/Overlay";
import { useFocusEffect } from "@react-navigation/native";
import { scanQRCode } from "../features/zipporaInfoSlice";
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestReview } from '@/components/rateApp';

type MainTabsParamList = {
  Home: undefined;
  BarcodeScan: undefined;
  Profile: undefined;
};

type BarcodeScanNavigationProp = BottomTabNavigationProp<MainTabsParamList, 'BarcodeScan'>;


const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const HEADER_HEIGHT = Platform.OS === "ios" ? 44 : 56;
const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 80 : 60;
const AVAILABLE_HEIGHT = SCREEN_HEIGHT - HEADER_HEIGHT - TAB_BAR_HEIGHT;

export default function BarcodeScan({ setCameraLoading }: { setCameraLoading: (loading: boolean) => void }) {
  const dispatch = useAppDispatch();
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [showCamera, setShowCamera] = useState(true); // State to control camera rendering
  const navigation = useNavigation<BarcodeScanNavigationProp>();
  const scanInFlightRef = useRef(false);

  useFocusEffect(
    React.useCallback(() => {
      setShowCamera(false);
      setCameraLoading(true); // Notify parent that camera is loading
      setTimeout(() => {
        setShowCamera(true);
        setCameraLoading(false); // Notify parent that camera is ready
      }, 500); // Adjust delay if needed
      setScanned(false);
      scanInFlightRef.current = false;

      
    }, [])
  );

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleBarCodeScanned = async({ data }: { data: string }) => {
    if (scanned || scanInFlightRef.current) return;
    scanInFlightRef.current = true;
    setScanned(true);

    try {
      await dispatch(scanQRCode(data)).unwrap();

      // Increment scan count for rating prompt
      let shouldRequestReview = false;
      try {
        const countStr = await AsyncStorage.getItem('scanSuccessCount');
        const newCount = countStr ? parseInt(countStr) + 1 : 1;
        await AsyncStorage.setItem('scanSuccessCount', newCount.toString());
        console.log('Scan Success Count:', newCount);
        if (newCount >= 2 && newCount % 2 === 0) {
          shouldRequestReview = true;
          await AsyncStorage.setItem('scanSuccessCount', '0');
        }
      } catch (e) {
        console.error('Error updating scan count', e);
      }

        // Signal Home to show a short non-blocking success banner.
        await AsyncStorage.setItem('lastScanSuccessAt', Date.now().toString());

      navigation.navigate('Home');
      setShowCamera(false);

      if (shouldRequestReview) {
        setTimeout(() => {
          requestReview().catch((reviewError) => {
            console.error('Error requesting app review', reviewError);
          });
        }, 300);
      }
    } catch (error) {
      console.error('Error Scaning qr Code', error);
      setScanned(false);
      scanInFlightRef.current = false;
      Alert.alert('Error', 'Failed to Scan QR code');
    }
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  if (!permission?.granted) {
    return <View style={styles.permissionContainer} />;
  }

  return (
    <View style={styles.container}>
      {showCamera && (
        <CameraView
          style={styles.camera}
          facing={facing}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        >
          <Overlay availableHeight={AVAILABLE_HEIGHT} />
          <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
            <MaterialIcons name="flip-camera-android" size={36} color="white" />
          </TouchableOpacity>
        </CameraView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    flex: 1,
  },
  flipButton: {
    position: "absolute",
    bottom: 40,
    right: 20,
  },
});
