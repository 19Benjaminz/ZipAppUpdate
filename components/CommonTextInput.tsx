import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, StyleProp, ViewStyle, TextInputProps } from 'react-native';
import * as Animatable from 'react-native-animatable';
import ZIPText from './ZIPText';
import ZIPTextInput from './ZIPTextInput';

const Color = {
    themeColor: '#2ABB67', // Replace with your preferred theme color
  };

interface CommonTextInputProps extends TextInputProps {
  style?: StyleProp<ViewStyle>;
  leftTitle: string;
  rightTitle?: string;
  onRightClick?: () => void;
}

const CommonTextInput: React.FC<CommonTextInputProps> = ({
  style,
  leftTitle,
  rightTitle = '',
  onRightClick,
  ...textInputProps
}) => {
  const [focus, setFocus] = useState(false);

  return (
    <Animatable.View
      transition="borderBottomColor"
      style={[
        styles.container,
        style,
        { borderBottomColor: focus ? Color.themeColor : 'lightgray' },
      ]}
    >
      <View style={styles.leftTitleContainer}>
        <ZIPText style={styles.leftTitleText}>{leftTitle}</ZIPText>
      </View>
      <ZIPTextInput
        style={styles.input}
        {...textInputProps}
        onBlur={() => setFocus(false)}
        onFocus={() => setFocus(true)}
      />
      {rightTitle ? (
        <TouchableOpacity
          style={styles.rightTitleContainer}
          activeOpacity={1}
          onPress={onRightClick}
        >
          <ZIPText style={styles.rightTitleText}>{rightTitle}</ZIPText>
        </TouchableOpacity>
      ) : null}
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 50,
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  leftTitleContainer: {
    height: 50,
    width: 95,
    justifyContent: 'center',
  },
  leftTitleText: {
    fontSize: 16,
    paddingLeft: 8,
  },
  input: {
    flex: 1,
  },
  rightTitleContainer: {
    paddingLeft: 4,
    height: 50,
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexDirection: 'row',
    paddingRight: 8,
  },
  rightTitleText: {
    color: Color.themeColor,
    fontSize: 16,
  },
});

export default CommonTextInput;