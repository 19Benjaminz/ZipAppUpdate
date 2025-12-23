import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ZIPText from '@/components/ZIPText';
import { useAppDispatch, useAppSelector } from '../../store';
import { getWalletBalance } from '../../features/walletSlice';
import { RootStackParamList } from '../../../components/types';

interface WalletFeatureProps {
    title: string;
    icon: any;
    onPress: () => void;
}

const WalletFeature: React.FC<WalletFeatureProps> = ({ title, icon, onPress }) => (
    <TouchableOpacity style={styles.featureItem} onPress={onPress}>
        <View style={styles.featureIconContainer}>
            {typeof icon === 'string' ? (
                <Icon name={icon} size={28} color="#4CAF50" />
            ) : (
                <Image source={icon} style={styles.featureIcon} />
            )}
        </View>
        <ZIPText style={styles.featureText}>{title}</ZIPText>
    </TouchableOpacity>
);

const Wallet: React.FC = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const dispatch = useAppDispatch();
    const { accessToken, memberId } = useAppSelector((state) => state.userInfo);
    const { balance, balanceLoading, balanceError } = useAppSelector((state) => state.wallet);

    // Fetch wallet balance on component mount
    useEffect(() => {
        if (accessToken && memberId) {
            dispatch(getWalletBalance({ accessToken, memberId }));
        }
    }, [dispatch, accessToken, memberId]);

    // Display balance with loading and error handling
    const renderBalance = () => {
        if (balanceLoading) {
            return (
                <View style={styles.balanceContainer}>
                    <ZIPText style={styles.balanceLabel}>Total Balance</ZIPText>
                    <ActivityIndicator size="large" color="white" style={{ marginVertical: 20 }} />
                    <ZIPText style={styles.balanceSubtext}>Loading...</ZIPText>
                </View>
            );
        }

        if (balanceError) {
            return (
                <View style={styles.balanceContainer}>
                    <ZIPText style={styles.balanceLabel}>Total Balance</ZIPText>
                    <ZIPText style={styles.balanceAmount}>--</ZIPText>
                    <ZIPText style={styles.balanceSubtext}>Error loading balance</ZIPText>
                    <TouchableOpacity 
                        style={styles.retryButton}
                        onPress={() => dispatch(getWalletBalance({ accessToken, memberId }))}
                    >
                        <ZIPText style={styles.retryText}>Tap to retry</ZIPText>
                    </TouchableOpacity>
                </View>
            );
        }

        const totalBalance = balance?.total || 0;
        const availableMoney = balance?.money || 0;
        const ubiCoins = balance?.ubi || 0;

        return (
            <View style={styles.balanceContainer}>
                <ZIPText style={styles.balanceLabel}>Total Balance</ZIPText>
                <ZIPText style={styles.balanceAmount}>${totalBalance.toFixed(2)}</ZIPText>
                <ZIPText style={styles.balanceSubtext}>
                    Available: ${availableMoney.toFixed(2)} • U-Coins: {ubiCoins}
                </ZIPText>
            </View>
        );
    };

    const walletFeatures = [
        {
            title: 'Recharge',
            icon: 'add-circle-outline',
            onPress: () => navigation.navigate('Profile/Wallet/Recharge'),
        },
        {
            title: 'Statement',
            icon: 'receipt-long',
            onPress: () => navigation.navigate('Profile/Wallet/Statement'),
        },
        // {
        //     title: 'Transaction\nHistory',
        //     icon: 'history',
        //     onPress: () => navigation.navigate('Profile/Wallet/TransactionHistory'),
        // },
        // {
        //     title: 'Credit Cards',
        //     icon: 'credit-card',
        //     onPress: () => navigation.navigate('Profile/Wallet/CreditCards'),
        // },
        // {
        //     title: 'Transfer',
        //     icon: 'swap-horiz',
        //     onPress: () => console.log('Transfer pressed - Coming soon'),
        // },
        // {
        //     title: 'Settings',
        //     icon: 'settings',
        //     onPress: () => console.log('Settings pressed - Coming soon'),
        // },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Balance Section */}
                <View style={styles.balanceSection}>
                    {renderBalance()}
                </View>

                {/* Features Grid Section */}
                <View style={styles.featuresSection}>
                    <ZIPText style={styles.sectionTitle}>Wallet Services</ZIPText>
                    <View style={styles.featuresGrid}>
                        {walletFeatures.map((feature, index) => (
                            <WalletFeature
                                key={index}
                                title={feature.title}
                                icon={feature.icon}
                                onPress={feature.onPress}
                            />
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollView: {
        flex: 1,
    },
    balanceSection: {
        backgroundColor: '#4CAF50',
        paddingTop: 40,
        paddingBottom: 50,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        marginBottom: 20,
    },
    balanceContainer: {
        alignItems: 'center',
    },
    balanceLabel: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 10,
    },
    balanceAmount: {
        fontSize: 48,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 5,
    },
    balanceSubtext: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    retryButton: {
        marginTop: 10,
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
    },
    retryText: {
        color: 'white',
        fontSize: 14,
        textAlign: 'center',
    },
    featuresSection: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 20,
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    featureItem: {
        width: '30%',
        aspectRatio: 1,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    featureIconContainer: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    featureIcon: {
        width: 28,
        height: 28,
        tintColor: '#4CAF50',
    },
    featureText: {
        fontSize: 12,
        textAlign: 'center',
        color: '#333',
        fontWeight: '500',
    },
});

export default Wallet;