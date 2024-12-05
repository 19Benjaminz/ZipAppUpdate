import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ZipporaHome from './Zippora/ZipporaHome';
import Profile from './Profile/Profile';
import BarcodeScan from './Camera/BarcodeScan';
import { Icon } from 'react-native-elements';
import { View, TouchableOpacity, StyleSheet, Text, Platform } from 'react-native';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName: string;

                    if (route.name === 'Home') {
                        iconName = 'home';
                    } else if (route.name === 'Profile') {
                        iconName = 'person';
                    } else {
                        iconName = 'help-outline'; // fallback icon name
                    }

                    return (
                        <Icon
                            name={iconName}
                            type="material"
                            color={color || 'gray'}
                            size={size || 24}
                        />
                    );
                },
                tabBarActiveTintColor: 'green',
                tabBarInactiveTintColor: 'gray',
                tabBarShowLabel: false,
                headerShown: false,
                tabBarStyle: {
                    height: Platform.OS === 'ios' ? 80 : 60, // Adds space for the button to overlay
                    paddingBottom: 10,
                    justifyContent: 'center',
                    alignContent: 'center'
                },
            })}
        >
            <Tab.Screen name="Home" component={ZipporaHome} />
            
            <Tab.Screen
                name="BarcodeScan"
                children={() => <BarcodeScan key={Math.random()} />} // Add a unique key to force remount
                options={{
                    tabBarButton: (props) => (
                    <TouchableOpacity
                        {...props}
                        style={styles.cameraButtonContainer}
                        activeOpacity={0.7}
                    >
                        <View style={styles.cameraButton}>
                        <Icon name="camera" type="material" color="white" size={28} />
                        </View>
                    </TouchableOpacity>
                    ),
                }}
            />

            <Tab.Screen name="Profile" component={Profile} />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    cameraButtonContainer: {
        bottom: '5%', // Fine-tune positioning
        height: 80,
        width: 80,
        borderRadius: 40, // Ensures perfect circle for the outer container
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    cameraButton: {
        width: 60,
        height: 60,
        marginBottom: 40,
        borderRadius: 30,
        backgroundColor: 'green',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000', // Optional shadow for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 5, // Shadow for Android
    },
    tabBarStyle: {
        height: Platform.OS === 'ios' ? 80 : 60,
        paddingBottom: 10,
    },
});