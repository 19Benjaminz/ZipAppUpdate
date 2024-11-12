import React, { useState, useEffect, useRef } from 'react';
import { View, Platform, ActivityIndicator, StatusBar } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Icon, Button } from 'react-native-elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ItemCell from '@/components/ItemCell';
import ZIPText from '@/components/ZIPText';

const Color = {
  bgColor: '#f0f0f0', // Background color
  blue: '#007AFF', // Blue color
  titleColor: '#333333', // Title color
};

const AddAddress = () => {
  const [state, setState] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    selectState: '',
    states: '',
    zipCode: '',
    currentLocation: '',
    loading: false,
    getLocationError: false,
    completed: false,
  });

  const hudRef = useRef(null);

  const isCompleted = () => {
    return (
      state.firstName &&
      state.lastName &&
      state.address &&
      state.city &&
      state.zipCode &&
      (Platform.OS === 'android' ? state.selectState : state.states) &&
      state.currentLocation
    );
  };

  return (
    <View style={{ flex: 1, flexDirection: 'column', backgroundColor: Color.bgColor }}>
      <StatusBar barStyle="light-content" animated />
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="always"
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
      >
        <ItemCell title="First Name" value={state.firstName} />
        <ItemCell title="Last Name" value={state.lastName} />
        <ItemCell title="Address" value={state.address} />
        <ItemCell title="City" value={state.city} />
        
        {Platform.OS === 'android' ? (
          <View style={{
              height: 45,
              backgroundColor: 'white',
              marginTop: 1,
              borderLeftColor: Color.blue,
              borderLeftWidth: 3,
              flexDirection: 'row',
              paddingLeft: 8,
              paddingRight: 8,
              alignItems: 'center',
            }}
          >
            <ZIPText style={{ color: Color.titleColor }}>State</ZIPText>
            <View style={{ flex: 1, alignItems: 'center', flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 8 }}>
              {state.loading ? (
                <ActivityIndicator animating size="small" />
              ) : (
                <Picker
                  selectedValue={state.selectState}
                  style={{ height: 35, width: 150 }}
                >
                  {/* Render Picker items from state.data */}
                </Picker>
              )}
              <Icon name="ios-arrow-forward" color={Color.blue} type="ionicon" />
            </View>
          </View>
        ) : (
          <ItemCell
            title="State"
            subTitle={state.states}
            noInput
            onPress={() => {
              // Modal to pick state
            }}
          />
        )}
        
        <ItemCell
          title="Postal Code"
          maxLength={5}
          value={state.zipCode}
        />
        <ItemCell
          title="Location"
          noInput
          subTitle={state.getLocationError ? 'get location' : state.currentLocation}
          onPress={() => {
            if (state.getLocationError) {
              // Trigger location retrieval
            }
          }}
        />
        
        <Button
          raised
          containerStyle={{ marginLeft: 0, marginRight: 0, marginTop: 20 }}
          buttonStyle={{ backgroundColor: Color.blue }}
          title="Next"
          disabled={!state.completed}
        />
      </KeyboardAwareScrollView>
    </View>
  );
};

export default AddAddress;
