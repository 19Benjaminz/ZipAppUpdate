import React from "react";
import { View, StyleSheet, Dimensions, Text, Platform } from "react-native";
import * as Animatable from "react-native-animatable";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

// Constants for header and tab bar heights
const HEADER_HEIGHT = Platform.OS === "ios" ? 44 : 56; // Adjust for iOS and Android headers
const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 80 : 60; // Match MainTabs tabBarStyle

const SCAN_BOX_SIZE = SCREEN_WIDTH * 0.7;

export default function Overlay({ availableHeight }: { availableHeight: number }) {
  return (
    <View style={styles.overlay}>
      {/* Top Darkened Area */}
      <View 
        style={[
            styles.overlayPart,
            StyleSheet.absoluteFillObject,
            {
                height: Platform.OS === "ios"
                ? (availableHeight - SCAN_BOX_SIZE) / 2 - availableHeight / 30
                :
                (availableHeight - SCAN_BOX_SIZE) / 2 - availableHeight / 60
            }
        ]}
      />
      {/* Bottom Darkened Area */}
      <View
        style={[
          styles.overlayPart,
          StyleSheet.absoluteFillObject,
          {
            height: Platform.OS === "ios" 
                ? (availableHeight - SCAN_BOX_SIZE) / 2 - availableHeight / 30
                :
                (availableHeight - SCAN_BOX_SIZE) / 2 - availableHeight / 60,
            bottom: 0,
            top: undefined,
          },
        ]}
      />
            {/* Left Darkened Area */}
            <View
        style={[
          styles.overlayPart,
          {
            width: (SCREEN_WIDTH - SCAN_BOX_SIZE) / 2,
            height: SCAN_BOX_SIZE + 1.2,
            top: Platform.OS === "ios" 
                ? (availableHeight - SCAN_BOX_SIZE) / 2 - availableHeight / 30
                :
                (availableHeight - SCAN_BOX_SIZE) / 2 - availableHeight / 60,
            left: 0,
          },
        ]}
      />
      {/* Right Darkened Area */}
      <View
        style={[
          styles.overlayPart,
          {
            width: (SCREEN_WIDTH - SCAN_BOX_SIZE) / 2,
            height: SCAN_BOX_SIZE + 1.2,
            top: Platform.OS === "ios" 
                ? (availableHeight - SCAN_BOX_SIZE) / 2 - availableHeight / 30
                :
                (availableHeight - SCAN_BOX_SIZE) / 2 - availableHeight / 60,
            right: 0,
            left: undefined,
          },
        ]}
      />

      {/* Scanning Box */}
      <View style={styles.container}>
        {/* Top-Left Corner */}
        <View style={[styles.corner, styles.topLeft]} />
        {/* Top-Right Corner */}
        <View style={[styles.corner, styles.topRight]} />
        {/* Bottom-Left Corner */}
        <View style={[styles.corner, styles.bottomLeft]} />
        {/* Bottom-Right Corner */}
        <View style={[styles.corner, styles.bottomRight]} />
        <View style={styles.scanBox}>
            <Animatable.View
            animation={{
                from: { marginTop: -(SCAN_BOX_SIZE - 10) },
                to: { marginTop: SCAN_BOX_SIZE - 10 },
            }}
            duration={2000}
            iterationCount="infinite"
            easing="linear"
            >
            <View style={styles.scanLine} />
            </Animatable.View>
            {/* Centered Text in the Box */}
            <Text style={styles.scanMessage}>Align QR code within the frame</Text>
        </View>
      </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayPart: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  container: {
    position: "absolute",
    top: "48.4%",
    left: "47.4%",
    marginTop: -(SCAN_BOX_SIZE / 2),
    marginLeft: -(SCAN_BOX_SIZE / 2),
    width: SCAN_BOX_SIZE + 20,
    height: SCAN_BOX_SIZE + 20,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  corner: {
    position: "absolute",
    width: 60,
    height: 60,
    borderColor: "green", // Adjust color as needed
  },
  topLeft: {
    top: 4,
    left: 4,
    borderTopWidth: 10,
    borderLeftWidth: 10,
  },
  topRight: {
    top: 4,
    right: 4,
    borderTopWidth: 10,
    borderRightWidth: 10,
  },
  bottomLeft: {
    bottom: 4,
    left: 4,
    borderBottomWidth: 10,
    borderLeftWidth: 10,
  },
  bottomRight: {
    bottom: 4,
    right: 4,
    borderBottomWidth: 10,
    borderRightWidth: 10,
  },
  scanBox: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -(SCAN_BOX_SIZE / 2),
    marginLeft: -(SCAN_BOX_SIZE / 2),
    width: SCAN_BOX_SIZE + 2,
    height: SCAN_BOX_SIZE + 2,
    borderWidth: 4,
    borderColor: "green",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  scanLine: {
    width: SCAN_BOX_SIZE - 20,
    height: 2,
    backgroundColor: "red",
    alignSelf: "center",
  },
  scanMessage: {
    marginTop: 20,
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
});
