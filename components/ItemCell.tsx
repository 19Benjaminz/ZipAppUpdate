import React from 'react';
import { View, TouchableOpacity, ActivityIndicator, StyleSheet, StyleProp, ViewStyle, TextInputProps } from 'react-native';
import { Icon } from 'react-native-elements';
import ZIPText from './ZIPText';
import ZIPTextInput from './ZIPTextInput';

const Color = {
  blue: '#007AFF', // Replace with your actual color
  titleColor: '#333333', // Replace with your actual color
};

interface ItemCellProps {
  title: string;
  onChangeText?: (text: string) => void;
  noInput?: boolean;
  subTitle?: string | null;
  onPress?: () => void;
  value?: string;
  maxLength?: number;
  keyboardType?: TextInputProps['keyboardType'];
  style?: StyleProp<ViewStyle>;
}

const ItemCell: React.FC<ItemCellProps> = ({
  title,
  onChangeText,
  noInput = false,
  subTitle,
  onPress,
  value,
  maxLength = 30,
  keyboardType = 'default',
  style,
}) => {
  return noInput ? (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
      <ZIPText style={styles.titleText}>{title}</ZIPText>
      <View style={styles.rightContent}>
        {subTitle === null ? (
          <ActivityIndicator animating size="small" />
        ) : (
          <ZIPText>{subTitle}</ZIPText>
        )}
      </View>
      <Icon name="ios-arrow-forward" color={Color.blue} type="ionicon" />
    </TouchableOpacity>
  ) : (
    <View style={[styles.container, style]}>
      <ZIPText style={styles.titleText}>{title}</ZIPText>
      <ZIPTextInput
        style={styles.input}
        onChangeText={onChangeText}
        value={value}
        maxLength={maxLength}
        keyboardType={keyboardType}
        autoCapitalize="none"
        autoCorrect={false}
        underlineColorAndroid="transparent"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 45,
    backgroundColor: 'white',
    marginTop: 1,
    borderLeftColor: Color.blue,
    borderLeftWidth: 3,
    flexDirection: 'row',
    paddingLeft: 8,
    paddingRight: 8,
    alignItems: 'center',
  },
  titleText: {
    color: Color.titleColor,
  },
  rightContent: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 8,
  },
  input: {
    flex: 1,
    marginLeft: 8,
  },
});

export default ItemCell;
