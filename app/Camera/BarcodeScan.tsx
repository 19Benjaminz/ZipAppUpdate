import React, { useState, useEffect } from "react";
import { Alert, StyleSheet, TouchableOpacity, View, Dimensions, Platform } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { MaterialIcons } from "@expo/vector-icons";
import { useAppDispatch } from "../store";
import Overlay from "@/components/Overlay";
import { useFocusEffect } from "@react-navigation/native";
import { scanQRCode } from "../features/zipporaInfoSlice";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const HEADER_HEIGHT = Platform.OS === "ios" ? 44 : 56;
const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 80 : 60;
const AVAILABLE_HEIGHT = SCREEN_HEIGHT - HEADER_HEIGHT - TAB_BAR_HEIGHT;

export default function BarcodeScan() {
  const dispatch = useAppDispatch();
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [showCamera, setShowCamera] = useState(true); // State to control camera rendering

  useFocusEffect(
    React.useCallback(() => {
      // Reset the camera state when screen is focused
      setShowCamera(false); // Unmount camera
      setTimeout(() => setShowCamera(true), 100); // Re-mount camera after unmounting
      setScanned(false); // Reset scanned state
    }, [])
  );

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleBarCodeScanned = async({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    try {
      const response = await dispatch(scanQRCode(data));
    } catch (error) {
      console.error('Error Scaning qr Code', error);
      Alert.alert('Error', 'Failed to Scan QR code');
    }
    Alert.alert("QR Code Scanned", `Data: ${data}`, [{ text: "OK", onPress: () => setScanned(false) }]);
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
