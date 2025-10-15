import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    Modal,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ZIPText from '@/components/ZIPText';
import { useAppDispatch, useAppSelector } from '../../store';
import { insertCreditCard } from '../../features/walletSlice';

interface AddCreditCardFormProps {
    onClose: () => void;
    onSuccess: () => void;
}

const AddCreditCardForm: React.FC<AddCreditCardFormProps> = ({ onClose, onSuccess }) => {
    const dispatch = useAppDispatch();
    const { accessToken, memberId } = useAppSelector((state) => state.userInfo);
    
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        cardNum: '',
        cardHolderName: '',
        expMonth: '',
        expYear: '',
        zipcode: '',
        isDefault: false,
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Generate random 3-digit CVV (for security - not stored)
    const generateRandomCVV = (): string => {
        return Math.floor(100 + Math.random() * 900).toString();
    };

    // Format card number input (add spaces every 4 digits)
    const formatCardNumber = (value: string): string => {
        const cleaned = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const parts = [];
        for (let i = 0, len = cleaned.length; i < len; i += 4) {
            parts.push(cleaned.substring(i, i + 4));
        }
        return parts.join(' ');
    };

    // Validate form data
    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        // Card number validation (16 digits)
        const cardNumClean = formData.cardNum.replace(/\s/g, '');
        if (!cardNumClean || cardNumClean.length !== 16) {
            newErrors.cardNum = 'Card number must be 16 digits';
        }

        // Cardholder name validation
        if (!formData.cardHolderName.trim()) {
            newErrors.cardHolderName = 'Cardholder name is required';
        }

        // Expiry month validation
        const month = parseInt(formData.expMonth);
        if (!formData.expMonth || month < 1 || month > 12) {
            newErrors.expMonth = 'Valid month (01-12) required';
        }

        // Expiry year validation
        const currentYear = new Date().getFullYear() % 100; // Get last 2 digits
        const year = parseInt(formData.expYear);
        if (!formData.expYear || year < currentYear || year > currentYear + 20) {
            newErrors.expYear = 'Valid year required';
        }

        // Zipcode validation (5 digits)
        if (!formData.zipcode || formData.zipcode.length !== 5) {
            newErrors.zipcode = 'Zipcode must be 5 digits';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            // Format expiry date as MMYY
            const expDate = formData.expMonth.padStart(2, '0') + formData.expYear.padStart(2, '0');
            
            // Generate random CVV for security
            const randomCVV = generateRandomCVV();

            const result = await dispatch(insertCreditCard({
                accessToken,
                memberId,
                cardNum: formData.cardNum.replace(/\s/g, ''), // Remove spaces
                cardHolderName: formData.cardHolderName.trim(),
                expDate,
                cvv2: randomCVV, // Random CVV for security
                zipcode: formData.zipcode,
                isDefault: formData.isDefault ? '1' : '0',
            })).unwrap();

            Alert.alert(
                'Success',
                'Credit card added successfully!',
                [{ text: 'OK', onPress: onSuccess }]
            );
        } catch (error: any) {
            Alert.alert(
                'Error',
                error || 'Failed to add credit card. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCardNumberChange = (value: string) => {
        const formatted = formatCardNumber(value);
        if (formatted.replace(/\s/g, '').length <= 16) {
            setFormData({ ...formData, cardNum: formatted });
            if (errors.cardNum) {
                setErrors({ ...errors, cardNum: '' });
            }
        }
    };

    return (
        <Modal
            visible={true}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Icon name="close" size={24} color="#333" />
                    </TouchableOpacity>
                    <ZIPText style={styles.title}>Add Credit Card</ZIPText>
                    <View style={styles.placeholder} />
                </View>

                <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                    {/* Card Number */}
                    <View style={styles.inputGroup}>
                        <ZIPText style={styles.label}>Card Number</ZIPText>
                        <TextInput
                            style={[styles.input, errors.cardNum && styles.inputError]}
                            placeholder="1234 5678 9012 3456"
                            value={formData.cardNum}
                            onChangeText={handleCardNumberChange}
                            keyboardType="numeric"
                            maxLength={19} // 16 digits + 3 spaces
                        />
                        {errors.cardNum && <ZIPText style={styles.errorText}>{errors.cardNum}</ZIPText>}
                    </View>

                    {/* Cardholder Name */}
                    <View style={styles.inputGroup}>
                        <ZIPText style={styles.label}>Cardholder Name</ZIPText>
                        <TextInput
                            style={[styles.input, errors.cardHolderName && styles.inputError]}
                            placeholder="John Doe"
                            value={formData.cardHolderName}
                            onChangeText={(value) => {
                                setFormData({ ...formData, cardHolderName: value });
                                if (errors.cardHolderName) {
                                    setErrors({ ...errors, cardHolderName: '' });
                                }
                            }}
                            autoCapitalize="words"
                        />
                        {errors.cardHolderName && <ZIPText style={styles.errorText}>{errors.cardHolderName}</ZIPText>}
                    </View>

                    {/* Expiry Date */}
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, styles.halfWidth]}>
                            <ZIPText style={styles.label}>Expiry Month</ZIPText>
                            <TextInput
                                style={[styles.input, errors.expMonth && styles.inputError]}
                                placeholder="MM"
                                value={formData.expMonth}
                                onChangeText={(value) => {
                                    if (value.length <= 2 && /^\d*$/.test(value)) {
                                        setFormData({ ...formData, expMonth: value });
                                        if (errors.expMonth) {
                                            setErrors({ ...errors, expMonth: '' });
                                        }
                                    }
                                }}
                                keyboardType="numeric"
                                maxLength={2}
                            />
                            {errors.expMonth && <ZIPText style={styles.errorText}>{errors.expMonth}</ZIPText>}
                        </View>

                        <View style={[styles.inputGroup, styles.halfWidth]}>
                            <ZIPText style={styles.label}>Expiry Year</ZIPText>
                            <TextInput
                                style={[styles.input, errors.expYear && styles.inputError]}
                                placeholder="YY"
                                value={formData.expYear}
                                onChangeText={(value) => {
                                    if (value.length <= 2 && /^\d*$/.test(value)) {
                                        setFormData({ ...formData, expYear: value });
                                        if (errors.expYear) {
                                            setErrors({ ...errors, expYear: '' });
                                        }
                                    }
                                }}
                                keyboardType="numeric"
                                maxLength={2}
                            />
                            {errors.expYear && <ZIPText style={styles.errorText}>{errors.expYear}</ZIPText>}
                        </View>
                    </View>

                    {/* Zipcode */}
                    <View style={styles.inputGroup}>
                        <ZIPText style={styles.label}>Billing Zipcode</ZIPText>
                        <TextInput
                            style={[styles.input, errors.zipcode && styles.inputError]}
                            placeholder="12345"
                            value={formData.zipcode}
                            onChangeText={(value) => {
                                if (value.length <= 5 && /^\d*$/.test(value)) {
                                    setFormData({ ...formData, zipcode: value });
                                    if (errors.zipcode) {
                                        setErrors({ ...errors, zipcode: '' });
                                    }
                                }
                            }}
                            keyboardType="numeric"
                            maxLength={5}
                        />
                        {errors.zipcode && <ZIPText style={styles.errorText}>{errors.zipcode}</ZIPText>}
                    </View>

                    {/* Security Notice */}
                    <View style={styles.securityNotice}>
                        <Icon name="security" size={20} color="#4CAF50" />
                        <ZIPText style={styles.securityText}>
                            For your security, CVV is not stored and will be randomly generated for each transaction
                        </ZIPText>
                    </View>

                    {/* Set as Default */}
                    <TouchableOpacity
                        style={styles.checkboxContainer}
                        onPress={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
                    >
                        <Icon
                            name={formData.isDefault ? 'check-box' : 'check-box-outline-blank'}
                            size={24}
                            color="#4CAF50"
                        />
                        <ZIPText style={styles.checkboxText}>Set as default payment method</ZIPText>
                    </TouchableOpacity>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" size="small" />
                        ) : (
                            <ZIPText style={styles.submitButtonText}>Add Card</ZIPText>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    closeButton: {
        padding: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    placeholder: {
        width: 40,
    },
    form: {
        flex: 1,
        padding: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: 'white',
    },
    inputError: {
        borderColor: '#f44336',
    },
    errorText: {
        color: '#f44336',
        fontSize: 12,
        marginTop: 4,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfWidth: {
        width: '48%',
    },
    securityNotice: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e8f5e8',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    securityText: {
        fontSize: 12,
        color: '#2e7d32',
        marginLeft: 8,
        flex: 1,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    checkboxText: {
        fontSize: 14,
        color: '#333',
        marginLeft: 8,
    },
    footer: {
        padding: 16,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    submitButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: '#ccc',
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AddCreditCardForm;