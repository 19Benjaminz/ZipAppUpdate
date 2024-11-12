import React from 'react';
import { TextInput, TextInputProps, Platform, StyleSheet, StyleProp, TextStyle } from 'react-native';

interface ZIPTextInputProps extends TextInputProps {
  style?: StyleProp<TextStyle>;
}

const ZIPTextInput = React.forwardRef<TextInput, ZIPTextInputProps>((props, ref) => {
  const { style, ...otherProps } = props;

  // Flatten style to ensure it's a TextStyle object and safely access fontWeight
  const flatStyle = StyleSheet.flatten(style) as TextStyle;

  const inputStyle: StyleProp<TextStyle> = [
    styles.defaultFontFamily,
    flatStyle,
    Platform.OS === 'android' && flatStyle?.fontWeight
      ? { fontFamily: 'Avenir-Medium', fontWeight: 'normal' as TextStyle['fontWeight'] }
      : undefined,
  ].filter(Boolean) as StyleProp<TextStyle>; // Ensure only valid styles are included

  return (
    <TextInput
      ref={ref}
      {...otherProps}
      style={inputStyle}
      underlineColorAndroid="transparent"
    />
  );
});

const styles = StyleSheet.create({
  defaultFontFamily: {
    fontFamily: 'Avenir-Medium',
  },
});

export default ZIPTextInput;
