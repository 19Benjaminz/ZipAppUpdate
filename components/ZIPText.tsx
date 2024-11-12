import React from 'react';
import { Text, TextProps, Platform, StyleProp, TextStyle } from 'react-native';

interface ZIPTextProps extends TextProps {
  style?: StyleProp<TextStyle>;
}

const ZIPText: React.FC<ZIPTextProps> = ({ style, ...props }) => {
  // Define the default font family
  const defaultFontFamily = Platform.OS === 'android' ? 'Avenir-Medium' : 'System';

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
