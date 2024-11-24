import React from 'react';
import { Text, TextProps, Platform, StyleProp, TextStyle } from 'react-native';
import { useFonts } from 'expo-font';

interface ZIPTextProps extends TextProps {
  style?: StyleProp<TextStyle>;
}

const ZIPText: React.FC<ZIPTextProps> = ({ style, ...props }) => {
  const [fontsLoaded] = useFonts({
    'Avenir-Medium': require('../assets/fonts/Avenir-Medium.ttf'), // Ensure this path is correct
  });
  // Define the default font family
  const defaultFontFamily = fontsLoaded
  ? 'Avenir-Medium'
  : Platform.OS === 'android'
  ? 'Roboto'
  : 'System';

  // Define the computed style
  const computedStyle: StyleProp<TextStyle> = [
    { fontFamily: defaultFontFamily },
    style,
    Platform.OS === 'android' && style && (style as TextStyle).fontWeight
      ? { fontWeight: 'normal' }
      : undefined,
  ];

  return <Text {...props} style={computedStyle} />;
};

export default ZIPText;
