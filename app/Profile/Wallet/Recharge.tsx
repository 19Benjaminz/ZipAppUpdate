import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    Modal,
    NativeModules,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ZIPText from '@/components/ZIPText';
import { useAppDispatch, useAppSelector } from '../../store';
import { 
    getRechargeConfig, 
    rechargeWithCreditCard, 
    getCreditCards,
    getWalletBalance,
    rechargeWithPayPal,
} from '../../features/walletSlice';

const { PayPal } = NativeModules;

interface PaymentMethod {
    type: 'creditcard' | 'paypal';
    label: string;
    icon: string;
}

import { walletApi } from '../../config/apiService';
const PAYMENT_METHODS: PaymentMethod[] = [
    // { type: 'creditcard', label: 'Credit Card', icon: 'credit-card' },
    { type: 'paypal', label: 'PayPal', icon: 'account-balance-wallet' },
];

const Recharge: React.FC = () => {
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const { accessToken, memberId } = useAppSelector((state) => state.userInfo);
    const { 
        rechargeConfig, 
        rechargeConfigLoading, 
        rechargeConfigError,
        creditCards,
        creditCardsLoading,
        balance
    } = useAppSelector((state) => state.wallet);
    
    const [customAmount, setCustomAmount] = useState<string>('');
    const [useCustomAmount, setUseCustomAmount] = useState<boolean>(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'creditcard' | 'paypal'>('paypal');
    const [selectedCardIndex, setSelectedCardIndex] = useState<number>(0);
    const [showCvvModal, setShowCvvModal] = useState<boolean>(false);
    const [cvv, setCvv] = useState<string>('');
    const [selectedRechargeIndex, setSelectedRechargeIndex] = useState<number>(0);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    // Load data on component mount
    useEffect(() => {
        if (accessToken && memberId) {
            dispatch(getRechargeConfig({ accessToken, memberId }));
            dispatch(getCreditCards({ accessToken, memberId }));
        }
    }, [dispatch, accessToken, memberId]);

    // Get the amount to charge
    const getRechargeAmount = (): number => {
        if (useCustomAmount) {
            return parseFloat(customAmount) || 0;
        }
        const validConfig = getValidRechargeConfig();
        if (validConfig && validConfig[selectedRechargeIndex]) {
            return validConfig[selectedRechargeIndex].amount;
        }
        return 0;
    };

    // Filter recharge config to only show amounts >= $5
    const getValidRechargeConfig = () => {
        if (!rechargeConfig) return [];
        return rechargeConfig.filter(config => config.amount >= 5);
    };

    // Validate minimum amount
    const isValidAmount = (): boolean => {
        const amount = getRechargeAmount();
        return amount >= 5; // $5 minimum
    };

    // Handle custom amount input
    const handleCustomAmountChange = (text: string) => {
        // Allow only numbers and one decimal point
        const numericValue = text.replace(/[^0-9.]/g, '');
        const parts = numericValue.split('.');
        if (parts.length <= 2) {
            setCustomAmount(numericValue);
        }
    };

    // Handle payment with credit card
    const handleCreditCardPayment = async () => {
        if (!creditCards || creditCards.length === 0) {
            Alert.alert('Error', 'No credit cards available. Please add a credit card first.');
            return;
        }

        if (!isValidAmount()) {
            Alert.alert('Error', 'Minimum recharge amount is $5.00');
            return;
        }

        // Show CVV modal for security
        setShowCvvModal(true);
    };

    // Process credit card payment with CVV
    const processCreditCardPayment = async () => {
        if (!cvv || cvv.length !== 3) {
            Alert.alert('Error', 'Please enter a valid 3-digit CVV');
            return;
        }

        setIsProcessing(true);
        setShowCvvModal(false);

        try {
            const selectedCard = creditCards![selectedCardIndex];
            const amount = getRechargeAmount();

            await dispatch(rechargeWithCreditCard({
                accessToken,
                memberId,
                amount,
                cardId: selectedCard.cardId,
            })).unwrap();

            // Refresh wallet balance
            dispatch(getWalletBalance({ accessToken, memberId }));

            Alert.alert(
                'Success',
                `Successfully recharged $${amount.toFixed(2)} to your wallet!`,
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );

        } catch (error: any) {
            Alert.alert(
                'Payment Failed',
                error || 'Failed to process payment. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setIsProcessing(false);
            setCvv('');
        }
    };

    // Handle PayPal payment with Braintree
    const handlePayPalPayment = () => {
        if (!isValidAmount()) {
            Alert.alert('Error', 'Minimum recharge amount is $5.00');
            return;
        }

        const amount = getRechargeAmount();
        if (amount <= 0) {
            Alert.alert('Error', 'Please select a valid amount');
            return;
        }

        // Check if PayPal module is available
        if (!PayPal || typeof PayPal.payWithAmount !== 'function') {
            Alert.alert(
                'PayPal Not Available',
                'PayPal payment module is not available on this platform. Please use an alternative payment method.',
                [{ text: 'OK' }]
            );
            return;
        }

        setIsProcessing(true);
        console.log('💳 Requesting PayPal payment via Braintree...');
        console.log(`Amount: $${amount.toFixed(2)}`);

        // Call native PayPal module - matches ZipNewApp implementation
        PayPal.payWithAmount(
            `${amount}`,
            async (signal: boolean, nonce: string) => {
                console.log('PayPal callback - signal:', signal, 'nonce:', nonce);
                console.log('Amount:', amount);
                
                if (!signal) {
                    // Payment cancelled or error
                    setIsProcessing(false);
                    Alert.alert(
                        'PayPal Payment Failed',
                        nonce === 'cancel' ? 'Payment was cancelled' : 
                        nonce === 'error' ? 'An error occurred during payment' : nonce,
                        [{ text: 'OK' }]
                    );
                    return;
                }

                try {
                    console.log('✅ PayPal payment successful, nonce:', nonce);

                    const result = await dispatch(
                        rechargeWithPayPal({
                            accessToken: accessToken!,
                            memberId: memberId!,
                            amount: amount,
                            paymentMethodNonce: nonce,
                        })
                    ).unwrap();

                    console.log('PayPal recharge result:', result);

                    Alert.alert(
                        '✅ PayPal Payment Successful!',
                        `💳 Payment completed successfully!\n\n` +
                        `Amount: $${amount.toFixed(2)}\n`,
                        [{ 
                            text: 'OK', 
                            onPress: () => {
                                setIsProcessing(false);
                                navigation.goBack();
                            }
                        }]
                    );
                } catch (error: any) {
                    console.error('PayPal Recharge Failed:', error?.message || error);
                    setIsProcessing(false);
                    Alert.alert(
                        'PayPal Recharge Failed',
                        error?.message || 'Failed to process PayPal recharge. Please try again.',
                        [{ text: 'OK' }]
                    );
                }
            }
        );
    };

    // Handle payment based on selected method
    const handlePayment = () => {
        if (selectedPaymentMethod === 'creditcard') {
            handleCreditCardPayment();
        } else if (selectedPaymentMethod === 'paypal') {
            handlePayPalPayment();
        }
    };

    // Render amount selection
    const renderAmountSelection = () => (
        <View style={styles.section}>
            <ZIPText style={styles.sectionTitle}>Select Amount</ZIPText>
            
            {/* Preset amounts */}
            {!rechargeConfigLoading && rechargeConfig && rechargeConfig.length > 0 && (
                <View style={styles.amountGrid}>
                    {getValidRechargeConfig().map((config, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.amountButton,
                                !useCustomAmount && selectedRechargeIndex === index && styles.amountButtonSelected
                            ]}
                            onPress={() => {
                                setUseCustomAmount(false);
                                setSelectedRechargeIndex(index);
                            }}
                        >
                            <ZIPText style={[
                                styles.amountButtonText,
                                !useCustomAmount && selectedRechargeIndex === index && styles.amountButtonTextSelected
                            ]}>
                                ${config.amount}
                            </ZIPText>
                            {config.plusUbi && (
                                <ZIPText style={styles.bonusText}>
                                    +{config.plusUbi} U-COIN
                                </ZIPText>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Custom amount */}
            <View style={styles.customAmountContainer}>
                <TouchableOpacity
                    style={[styles.customAmountToggle, useCustomAmount && styles.customAmountToggleActive]}
                    onPress={() => setUseCustomAmount(!useCustomAmount)}
                >
                    <Icon
                        name={useCustomAmount ? 'radio-button-checked' : 'radio-button-unchecked'}
                        size={20}
                        color={useCustomAmount ? '#4CAF50' : '#666'}
                    />
                    <ZIPText style={[styles.customAmountText, useCustomAmount && styles.customAmountTextActive]}>
                        Custom Amount
                    </ZIPText>
                </TouchableOpacity>
                
                {useCustomAmount && (
                    <View style={styles.customInputContainer}>
                        <ZIPText style={styles.dollarSign}>$</ZIPText>
                        <TextInput
                            style={styles.customInput}
                            placeholder="Enter amount (min $5.00)"
                            value={customAmount}
                            onChangeText={handleCustomAmountChange}
                            keyboardType="numeric"
                            maxLength={8}
                        />
                    </View>
                )}
            </View>

            {/* Amount validation */}
            {getRechargeAmount() > 0 && !isValidAmount() && (
                <ZIPText style={styles.errorText}>Minimum amount is $5.00</ZIPText>
            )}
        </View>
    );

    // Render payment method selection
    const renderPaymentMethods = () => (
        <View style={styles.section}>
            <ZIPText style={styles.sectionTitle}>Payment Method</ZIPText>
            
            {PAYMENT_METHODS.map((method) => (
                <TouchableOpacity
                    key={method.type}
                    style={[
                        styles.paymentMethodButton,
                        selectedPaymentMethod === method.type && styles.paymentMethodButtonSelected
                    ]}
                    onPress={() => setSelectedPaymentMethod(method.type)}
                >
                    <Icon
                        name={method.icon}
                        size={24}
                        color={selectedPaymentMethod === method.type ? '#4CAF50' : '#666'}
                    />
                    <ZIPText style={[
                        styles.paymentMethodText,
                        selectedPaymentMethod === method.type && styles.paymentMethodTextSelected
                    ]}>
                        {method.label}
                    </ZIPText>
                    <Icon
                        name={selectedPaymentMethod === method.type ? 'radio-button-checked' : 'radio-button-unchecked'}
                        size={20}
                        color={selectedPaymentMethod === method.type ? '#4CAF50' : '#666'}
                    />
                </TouchableOpacity>
            ))}
        </View>
    );

    // Render credit card selection
    const renderCreditCardSelection = () => {
        if (selectedPaymentMethod !== 'creditcard') return null;

        if (creditCardsLoading) {
            return (
                <View style={styles.section}>
                    <ActivityIndicator size="small" color="#4CAF50" />
                    <ZIPText style={styles.loadingText}>Loading credit cards...</ZIPText>
                </View>
            );
        }

        if (!creditCards || creditCards.length === 0) {
            return (
                <View style={styles.section}>
                    <ZIPText style={styles.sectionTitle}>Credit Cards</ZIPText>
                    <View style={styles.noCreditCardsContainer}>
                        <Icon name="credit-card" size={60} color="#ddd" />
                        <ZIPText style={styles.noCreditCardsText}>No credit cards found</ZIPText>
                        <TouchableOpacity
                            style={styles.addCardButton}
                            onPress={() => navigation.navigate('Profile/Wallet/CreditCards' as never)}
                        >
                            <ZIPText style={styles.addCardButtonText}>Add Credit Card</ZIPText>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.section}>
                <ZIPText style={styles.sectionTitle}>Select Credit Card</ZIPText>
                {creditCards.map((card, index) => (
                    <TouchableOpacity
                        key={card.cardId}
                        style={[
                            styles.creditCardButton,
                            selectedCardIndex === index && styles.creditCardButtonSelected
                        ]}
                        onPress={() => setSelectedCardIndex(index)}
                    >
                        <Icon
                            name="credit-card"
                            size={24}
                            color={selectedCardIndex === index ? '#4CAF50' : '#666'}
                        />
                        <View style={styles.creditCardInfo}>
                            <ZIPText style={styles.creditCardNumber}>**** **** **** {card.cardLast4}</ZIPText>
                            <ZIPText style={styles.creditCardName}>{card.cardHolderName}</ZIPText>
                        </View>
                        <Icon
                            name={selectedCardIndex === index ? 'radio-button-checked' : 'radio-button-unchecked'}
                            size={20}
                            color={selectedCardIndex === index ? '#4CAF50' : '#666'}
                        />
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    // Render payment summary
    const renderPaymentSummary = () => {
        const amount = getRechargeAmount();
        if (amount === 0) return null;

        return (
            <View style={styles.section}>
                <ZIPText style={styles.sectionTitle}>Payment Summary</ZIPText>
                <View style={styles.summaryContainer}>
                    <View style={styles.summaryRow}>
                        <ZIPText style={styles.summaryLabel}>Amount:</ZIPText>
                        <ZIPText style={styles.summaryValue}>${amount.toFixed(2)}</ZIPText>
                    </View>
                    {!useCustomAmount && getValidRechargeConfig()[selectedRechargeIndex]?.plusUbi && (
                        <View style={styles.summaryRow}>
                            <ZIPText style={styles.summaryLabel}>Bonus U-COIN:</ZIPText>
                            <ZIPText style={styles.summaryValue}>
                                +{getValidRechargeConfig()[selectedRechargeIndex].plusUbi}
                            </ZIPText>
                        </View>
                    )}
                    <View style={styles.summaryRow}>
                        <ZIPText style={styles.summaryLabel}>Payment Method:</ZIPText>
                        <ZIPText style={styles.summaryValue}>
                            {selectedPaymentMethod === 'creditcard' ? 'Credit Card' : 
                             selectedPaymentMethod === 'paypal' ? 'PayPal' : 'Stripe'}
                        </ZIPText>
                    </View>
                    {balance && (
                        <View style={styles.summaryRow}>
                            <ZIPText style={styles.summaryLabel}>Current Balance:</ZIPText>
                            <ZIPText style={styles.summaryValue}>${balance.money}</ZIPText>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    // Render CVV modal
    const renderCvvModal = () => (
        <Modal
            visible={showCvvModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowCvvModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <ZIPText style={styles.modalTitle}>Enter CVV</ZIPText>
                        <TouchableOpacity onPress={() => setShowCvvModal(false)}>
                            <Icon name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.modalContent}>
                        <Icon name="security" size={60} color="#4CAF50" />
                        <ZIPText style={styles.cvvDescription}>
                            For your security, please enter the 3-digit CVV from the back of your card. 
                            This is used only for this transaction and is not stored.
                        </ZIPText>
                        
                        <TextInput
                            style={styles.cvvInput}
                            placeholder="CVV"
                            value={cvv}
                            onChangeText={setCvv}
                            keyboardType="numeric"
                            maxLength={3}
                            secureTextEntry={true}
                        />
                        
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => {
                                    setShowCvvModal(false);
                                    setCvv('');
                                }}
                            >
                                <ZIPText style={styles.cancelButtonText}>Cancel</ZIPText>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={[styles.confirmButton, (!cvv || cvv.length !== 3) && styles.confirmButtonDisabled]}
                                onPress={processCreditCardPayment}
                                disabled={!cvv || cvv.length !== 3}
                            >
                                <ZIPText style={styles.confirmButtonText}>Confirm Payment</ZIPText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );

    if (rechargeConfigLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                    <ZIPText style={styles.loadingText}>Loading recharge options...</ZIPText>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {renderAmountSelection()}
                {renderPaymentMethods()}
                {/* {renderCreditCardSelection()} */}
                {renderPaymentSummary()}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.payButton,
                        (!isValidAmount() || isProcessing) && styles.payButtonDisabled
                    ]}
                    onPress={handlePayment}
                    disabled={!isValidAmount() || isProcessing}
                >
                    {isProcessing ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <ZIPText style={styles.payButtonText}>
                            Pay ${getRechargeAmount().toFixed(2)}
                        </ZIPText>
                    )}
                </TouchableOpacity>
            </View>

            {renderCvvModal()}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    section: {
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 12,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    amountGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    amountButton: {
        width: '48%',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    amountButtonSelected: {
        backgroundColor: '#e8f5e8',
        borderColor: '#4CAF50',
    },
    amountButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    amountButtonTextSelected: {
        color: '#4CAF50',
    },
    bonusText: {
        fontSize: 12,
        color: '#4CAF50',
        marginTop: 4,
    },
    customAmountContainer: {
        marginTop: 8,
    },
    customAmountToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    customAmountToggleActive: {
        // No additional styling needed for now
    },
    customAmountText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 8,
    },
    customAmountTextActive: {
        color: '#4CAF50',
        fontWeight: '500',
    },
    customInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        marginTop: 12,
        paddingHorizontal: 12,
    },
    dollarSign: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginRight: 8,
    },
    customInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 12,
        color: '#333',
    },
    errorText: {
        color: '#f44336',
        fontSize: 14,
        marginTop: 8,
    },
    paymentMethodButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 12,
        backgroundColor: '#f5f5f5',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    paymentMethodButtonSelected: {
        backgroundColor: '#e8f5e8',
        borderColor: '#4CAF50',
    },
    paymentMethodText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 12,
        flex: 1,
    },
    paymentMethodTextSelected: {
        color: '#4CAF50',
        fontWeight: '500',
    },
    creditCardButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 12,
        backgroundColor: '#f5f5f5',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    creditCardButtonSelected: {
        backgroundColor: '#e8f5e8',
        borderColor: '#4CAF50',
    },
    creditCardInfo: {
        flex: 1,
        marginLeft: 12,
    },
    creditCardNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        fontFamily: 'monospace',
    },
    creditCardName: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    noCreditCardsContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    noCreditCardsText: {
        fontSize: 16,
        color: '#666',
        marginTop: 16,
        marginBottom: 20,
    },
    addCardButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    addCardButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    summaryContainer: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        padding: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    footer: {
        backgroundColor: 'white',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    payButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
    },
    payButtonDisabled: {
        backgroundColor: '#ccc',
    },
    payButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        margin: 20,
        width: '90%',
        maxWidth: 400,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    modalContent: {
        padding: 20,
        alignItems: 'center',
    },
    cvvDescription: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginVertical: 16,
        lineHeight: 20,
    },
    cvvInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 18,
        textAlign: 'center',
        width: 100,
        marginVertical: 20,
        fontFamily: 'monospace',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 20,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginRight: 8,
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '500',
    },
    confirmButton: {
        flex: 1,
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginLeft: 8,
    },
    confirmButtonDisabled: {
        backgroundColor: '#ccc',
    },
    confirmButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default Recharge;