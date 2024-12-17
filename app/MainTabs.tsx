import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ZipporaHome from './Zippora/ZipporaHome';
import Profile from './Profile/Profile';
import BarcodeScan from './Camera/BarcodeScan';
import { Icon } from 'react-native-elements';
import { View, TouchableOpacity, StyleSheet, Text, Platform, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useAppDispatch, useAppSelector } from './store';
import { setAccessToken, setMemberId } from './features/userInfoSlice';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(true); // Add loading state

    useEffect(() => {
        const initializeAuth = async () => {
            const accessToken = (await SecureStore.getItemAsync('accessToken')) || '';
            const memberId = (await SecureStore.getItemAsync('memberId')) || '';
            console.log("Initializing credentials...");
      
            dispatch(setAccessToken(accessToken));
            dispatch(setMemberId(memberId));
            setLoading(false); // Mark loading as complete
        };

        initializeAuth();
    }, [dispatch]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="green" />
            </View>
        );
    }

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
                        iconName = 'help-outline';
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
            })}
        >
            <Tab.Screen name="Home" component={ZipporaHome} />
            
            <Tab.Screen
                name="BarcodeScan"
                children={() => <BarcodeScan key={Math.random()} />}
                options={{
                    tabBarButton: (props) => (
                        <TouchableOpacity {...props} style={styles.cameraButtonContainer} activeOpacity={0.7}>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    cameraButtonContainer: {
        bottom: '5%',
        height: 80,
        width: 80,
        borderRadius: 40,
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 5,
    },
});
