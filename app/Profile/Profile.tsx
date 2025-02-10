import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
    StyleSheet,
} from 'react-native';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ZIPText from '@/components/ZIPText';
import { RootStackParamList } from '../../components/types';
import { useAppDispatch, useAppSelector } from '../store';
import { getUser } from '../features/userInfoSlice';

interface ProfileItemProps {
    title: string;
    icon: any;
    onPress: () => void;
}

const ProfileItem: React.FC<ProfileItemProps> = ({ title, icon, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.itemContainer} disabled={false}>
        <Image source={icon} style={styles.itemIcon} />
        <ZIPText style={styles.itemText}>{title}</ZIPText>
        <Icon name="arrow-forward-ios" color={'green'} size={20} style={styles.itemIconRight} />
    </TouchableOpacity>
);

const Profile: React.FC<{ setProfileLoading: (loading: boolean) => void }> = ({ setProfileLoading }) => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);
    const { profile, member, accessToken, memberId } = useAppSelector((state) => state.userInfo);

    const handleRefresh = async () => {
        try {
            setLoading(true); // Start local loading
            setProfileLoading(true); // 🚀 Disable tab buttons in MainTabs

            await dispatch(getUser({ accessToken, memberId })).unwrap();

        } catch (error) {
            console.error('Error refreshing profile data:', error);
        } finally {
            setLoading(false);
            setProfileLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            handleRefresh(); // Fetch profile data when screen is focused

            return () => {
                setProfileLoading(false); // ✅ Ensure cleanup when navigating away
            };
        }, [dispatch, accessToken, memberId])
    );

    const handleNavigation = (screen: any) => {
        navigation.navigate(screen);
    };

    const renderProfileItems = () => {
        const items = [
            {
                title: 'About Us',
                icon: require('../../assets/images/aboutus.png'),
                screen: 'Profile/AboutUs' as keyof RootStackParamList,
            },
            {
                title: 'Zippora Logs',
                icon: require('../../assets/images/zipporalog.png'),
                screen: 'Zippora/ZipLogs' as keyof RootStackParamList,
            },
            {
                title: 'Subscribe to New Apartment',
                icon: require('../../assets/images/apartment.png'),
                screen: 'Zippora/SubToAPT' as keyof RootStackParamList,
            }
        ];

        return items.map((item, index) => (
            <ProfileItem
                key={index}
                title={item.title}
                icon={item.icon}
                onPress={() => handleNavigation(item.screen)}
            />
        ));
    };

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollContainer}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={handleRefresh} />}
            >
                <TouchableOpacity style={styles.profileContainer} onPress={() => handleNavigation('Profile/PersonalInfo')}>
                    <Image
                        source={profile?.avatar ? { uri: profile.avatar } : require('../../assets/images/proimage.png')}
                        style={styles.avatar}
                    />
                    <View style={styles.profileDetails}>
                        <ZIPText style={styles.profileName}>{profile.nickName || 'Guest'}</ZIPText>
                        <ZIPText style={styles.profilePhone}>{member.phone}</ZIPText>
                    </View>
                    <Icon name="arrow-forward-ios" color={'green'} size={20} />
                </TouchableOpacity>
                <View style={styles.itemsContainer}>{renderProfileItems()}</View>
            </ScrollView>
            <View style={styles.versionContainer}>
                <Text style={styles.versionText}>Version: 0.0.0</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    scrollContainer: {
        flex: 1,
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f5f5f5',
        borderBottomWidth: 1,
        borderColor: '#ddd',
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    profileDetails: {
        flex: 1,
        marginLeft: 12,
    },
    profileName: {
        fontSize: 18,
        fontWeight: '600',
        color: 'black',
    },
    profilePhone: {
        fontSize: 14,
        color: 'gray',
    },
    itemsContainer: {
        marginTop: 8,
        backgroundColor: 'white',
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    itemIcon: {
        width: 24,
        height: 24,
        marginRight: 12,
    },
    itemText: {
        flex: 1,
        fontSize: 16,
        color: 'black',
    },
    itemIconRight: {
        marginLeft: 8,
    },
    versionContainer: {
        padding: 10,
        alignItems: 'center',
        backgroundColor: 'white',
    },
    versionText: {
        fontSize: 14,
        color: 'gray',
    },
});

export default Profile;
