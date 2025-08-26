import React from "react";
import { View, StyleSheet, Dimensions, Text, Platform } from "react-native";
import * as Animatable from "react-native-animatable";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

// Constants for header and tab bar heights (approximate, matches MainTabs/header)
const HEADER_HEIGHT = Platform.OS === "ios" ? 44 : 56;
const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 80 : 60;

export default function Overlay({ availableHeight }: { availableHeight: number }) {
  // Compute the usable camera area between header and tab bar
  const containerTop = HEADER_HEIGHT;
  const containerBottom = TAB_BAR_HEIGHT;
  const containerHeight = SCREEN_HEIGHT - containerTop - containerBottom;

  // Derive scan box size and exact coordinates at center
  const SCAN_SIZE = Math.round(
    Math.min(SCREEN_WIDTH * 0.7, containerHeight * 0.65)
  );
  const centerX = Math.round(SCREEN_WIDTH / 2);
  // Move the scan area up by ~15% of the usable height
  const OFFSET_FRACTION = 0.10;
  const desiredCenterY = containerTop + containerHeight * (0.5 - OFFSET_FRACTION);
  // Initial proposed top
  let scanTop = Math.round(desiredCenterY - SCAN_SIZE / 2);
  // Clamp inside the usable area to avoid going beyond header/tab space
  const minTop = containerTop + 4;
  const maxTop = containerTop + containerHeight - SCAN_SIZE - 4;
  scanTop = Math.max(minTop, Math.min(scanTop, maxTop));
  const scanLeft = centerX - Math.round(SCAN_SIZE / 2);

  // Make the hole slightly smaller than the border rectangle so that
  // rounded corners don't leave transparent slivers outside the box.
  const HOLE_INSET = 3.5; // tweak if you want more/less margin
  const HOLE_SIZE = Math.max(1, SCAN_SIZE - HOLE_INSET * 2);
  const holeTop = scanTop + HOLE_INSET;
  const holeLeft = scanLeft + HOLE_INSET;

  return (
    <View style={styles.overlay}>
      {/* Mask: only the scan rect is transparent */}
      {/* Top mask */}
  <View style={[styles.mask, { top: 0, left: 0, right: 0, height: holeTop }]} />
      {/* Bottom mask */}
      <View
        style={[
          styles.mask,
          { top: holeTop + HOLE_SIZE, left: 0, right: 0, bottom: 0 },
        ]}
      />
      {/* Left mask */}
      <View
        style={[
          styles.mask,
          { top: holeTop, left: 0, width: holeLeft, height: HOLE_SIZE },
        ]}
      />
      {/* Right mask */}
      <View
        style={[
          styles.mask,
          {
            top: holeTop,
            left: holeLeft + HOLE_SIZE,
            right: 0,
            height: HOLE_SIZE,
          },
        ]}
      />

      {/* Scan box border with corners */}
      <View
        style={[
          styles.scanBox,
          { top: scanTop, left: scanLeft, width: SCAN_SIZE, height: SCAN_SIZE },
        ]}
      >
        {/* Corners */}
        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />

        {/* Scan line animation */}
        <Animatable.View
          animation={{ from: { top: HOLE_INSET + 4 }, to: { top: HOLE_INSET + HOLE_SIZE - 6 } }}
          duration={2000}
          iterationCount="infinite"
          easing="linear"
          style={[StyleSheet.absoluteFill, { left: 0, right: 0 }]}
        >
          <View
            style={{
              alignSelf: "center",
              width: HOLE_SIZE - 12,
              height: 2,
              backgroundColor: "#ff3b30",
            }}
          />
        </Animatable.View>

        {/* Helper text */}
        <View style={{ position: "absolute", bottom: -36, left: 0, right: 0 }}>
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
  mask: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.6)", // grayish transparent
  },
  scanBox: {
    position: "absolute",
    borderWidth: 3,
    borderColor: "#00c853",
    borderRadius: 12,
    overflow: "hidden",
  },
  corner: {
    position: "absolute",
    width: 36,
    height: 36,
    borderColor: "#00c853",
  },
  topLeft: { top: -1.5, left: -1.5, borderTopWidth: 6, borderLeftWidth: 6 },
  topRight: { top: -1.5, right: -1.5, borderTopWidth: 6, borderRightWidth: 6 },
  bottomLeft: {
    bottom: -1.5,
    left: -1.5,
    borderBottomWidth: 6,
    borderLeftWidth: 6,
  },
  bottomRight: {
    bottom: -1.5,
    right: -1.5,
    borderBottomWidth: 6,
    borderRightWidth: 6,
  },
  scanMessage: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
});
