import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ZIPText from '@/components/ZIPText';
import { useAppDispatch, useAppSelector } from '@/store';
import { getCreditCards } from '../../features/walletSlice';
import { RootStackParamList } from '../../../components/types';
import AddCreditCardForm from './AddCreditCardForm';

const PaymentMethod: React.FC = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const dispatch = useAppDispatch();
    const { accessToken, memberId } = useAppSelector((state) => state.userInfo);
    const { creditCards, creditCardsLoading, creditCardsError, defaultCardIndex } = useAppSelector((state) => state.wallet);
    
    const [showAddForm, setShowAddForm] = useState(false);

    // Fetch credit cards on component mount
    useEffect(() => {
        if (accessToken && memberId) {
            dispatch(getCreditCards({ accessToken, memberId }));
        }
    }, [dispatch, accessToken, memberId]);

    const handleAddCard = () => {
        setShowAddForm(true);
    };

    const handleFormClose = () => {
        setShowAddForm(false);
    };

    const handleFormSuccess = () => {
        setShowAddForm(false);
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Icon name="credit-card" size={80} color="#ddd" />
            <ZIPText style={styles.emptyTitle}>No Payment Methods</ZIPText>
            <ZIPText style={styles.emptySubtitle}>
                Add a credit card to make payments easier
            </ZIPText>
            <TouchableOpacity style={styles.addButton} onPress={handleAddCard}>
                <Icon name="add" size={24} color="white" />
                <ZIPText style={styles.addButtonText}>Add Credit Card</ZIPText>
            </TouchableOpacity>
        </View>
    );

    const renderCreditCard = (card: any, index: number) => {
        const isDefault = index === defaultCardIndex;
        
        return (
            <View key={card.cardId} style={styles.cardContainer}>
                <View style={styles.cardHeader}>
                    <View style={styles.cardInfo}>
                        <ZIPText style={styles.cardNumber}>**** **** **** {card.cardLast4}</ZIPText>
                        <ZIPText style={styles.cardHolder}>{card.cardHolderName}</ZIPText>
                        <ZIPText style={styles.cardType}>{card.cardType}</ZIPText>
                    </View>
                    {isDefault && (
                        <View style={styles.defaultBadge}>
                            <ZIPText style={styles.defaultText}>Default</ZIPText>
                        </View>
                    )}
                </View>
                
                <View style={styles.cardActions}>
                    {!isDefault && (
                        <TouchableOpacity style={styles.actionButton}>
                            <ZIPText style={styles.actionText}>Set as Default</ZIPText>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={[styles.actionButton, styles.deleteButton]}>
                        <ZIPText style={[styles.actionText, styles.deleteText]}>Delete</ZIPText>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderPaymentMethodsList = () => (
        <View style={styles.container}>
            <View style={styles.header}>
                <ZIPText style={styles.title}>Payment Method</ZIPText>
                <TouchableOpacity style={styles.addIconButton} onPress={handleAddCard}>
                    <Icon name="add" size={24} color="#4CAF50" />
                </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.cardsList}>
                {creditCards.map((card, index) => renderCreditCard(card, index))}
            </ScrollView>
        </View>
    );

    const renderContent = () => {
        if (creditCardsLoading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                    <ZIPText style={styles.loadingText}>Loading payment methods...</ZIPText>
                </View>
            );
        }

        if (creditCardsError) {
            return (
                <View style={styles.errorContainer}>
                    <Icon name="error" size={60} color="#f44336" />
                    <ZIPText style={styles.errorTitle}>Error Loading Payment Methods</ZIPText>
                    <ZIPText style={styles.errorSubtitle}>{creditCardsError}</ZIPText>
                    <TouchableOpacity 
                        style={styles.retryButton}
                        onPress={() => dispatch(getCreditCards({ accessToken, memberId }))}
                    >
                        <ZIPText style={styles.retryText}>Try Again</ZIPText>
                    </TouchableOpacity>
                </View>
            );
        }

        if (creditCards.length === 0) {
            return renderEmptyState();
        }

        return renderPaymentMethodsList();
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {renderContent()}
            
            {showAddForm && (
                <AddCreditCardForm
                    onClose={handleFormClose}
                    onSuccess={handleFormSuccess}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    addIconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
        marginBottom: 10,
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4CAF50',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        marginTop: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#f44336',
        marginTop: 16,
        marginBottom: 8,
    },
    errorSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    retryText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    cardsList: {
        flex: 1,
    },
    cardContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    cardInfo: {
        flex: 1,
    },
    cardNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        fontFamily: 'Menlo',
        marginBottom: 4,
    },
    cardHolder: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    cardType: {
        fontSize: 12,
        color: '#999',
        textTransform: 'uppercase',
    },
    defaultBadge: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    defaultText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    actionButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#4CAF50',
    },
    actionText: {
        color: '#4CAF50',
        fontSize: 14,
        fontWeight: '500',
    },
    deleteButton: {
        borderColor: '#f44336',
    },
    deleteText: {
        color: '#f44336',
    },
});

export default PaymentMethod;
