import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ZIPText from '@/components/ZIPText';
import { useAppDispatch, useAppSelector } from '../../store';
import { getStatements } from '../../features/walletSlice';

interface StatementType {
    key: string;
    label: string;
    icon: string;
}

const STATEMENT_TYPES: StatementType[] = [
    { key: 'all', label: 'All', icon: 'list' },
    { key: 'recharge', label: 'Recharge', icon: 'account-balance-wallet' },
    { key: 'zippora', label: 'Zippora', icon: 'local-shipping' },
];

const Statement: React.FC = () => {
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const { accessToken, memberId } = useAppSelector((state) => state.userInfo);
    const { statements, statementsLoading, statementsError } = useAppSelector((state) => state.wallet);
    
    const [selectedType, setSelectedType] = useState<string>('all');
    const [refreshing, setRefreshing] = useState(false);

    // Fetch statements on component mount and when type changes
    useEffect(() => {
        if (accessToken && memberId) {
            fetchStatements();
        }
    }, [dispatch, accessToken, memberId, selectedType]);

    const fetchStatements = async () => {
        try {
            await dispatch(getStatements({
                accessToken,
                memberId,
                type: selectedType === 'all' ? undefined : selectedType
            })).unwrap();
        } catch (error) {
            console.error('Failed to fetch statements:', error);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchStatements();
        setRefreshing(false);
    };

    const getAmountColor = (amount: string): string => {
        const numAmount = parseFloat(amount);
        return numAmount >= 0 ? '#4CAF50' : '#f44336';
    };

    const getAmountSign = (amount: string): string => {
        const numAmount = parseFloat(amount);
        return numAmount >= 0 ? '+' : '';
    };

    const formatDate = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    const renderTypeSelector = () => (
        <View style={styles.typeSelector}>
            {STATEMENT_TYPES.map((type) => (
                <TouchableOpacity
                    key={type.key}
                    style={[
                        styles.typeButton,
                        selectedType === type.key && styles.typeButtonActive
                    ]}
                    onPress={() => setSelectedType(type.key)}
                >
                    <Icon
                        name={type.icon}
                        size={20}
                        color={selectedType === type.key ? 'white' : '#666'}
                    />
                    <ZIPText style={[
                        styles.typeButtonText,
                        selectedType === type.key && styles.typeButtonTextActive
                    ]}>
                        {type.label}
                    </ZIPText>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Icon name="receipt-long" size={80} color="#ddd" />
            <ZIPText style={styles.emptyTitle}>No Statements</ZIPText>
            <ZIPText style={styles.emptySubtitle}>
                {selectedType === 'all' 
                    ? 'No transaction statements found'
                    : `No ${selectedType} statements found`
                }
            </ZIPText>
        </View>
    );

    const renderStatementItem = (statement: any, index: number) => (
        <View key={statement.statementId || index} style={styles.statementItem}>
            <View style={styles.statementHeader}>
                <View style={styles.statementInfo}>
                    <ZIPText style={styles.statementTitle}>{statement.title}</ZIPText>
                    <ZIPText style={styles.statementDate}>
                        {formatDate(statement.createTime)}
                    </ZIPText>
                </View>
                <View style={styles.amountContainer}>
                    <ZIPText style={[
                        styles.statementAmount,
                        { color: getAmountColor(statement.amount) }
                    ]}>
                        {getAmountSign(statement.amount)}${Math.abs(parseFloat(statement.amount)).toFixed(2)}
                    </ZIPText>
                    {statement.money && (
                        <ZIPText style={styles.statementMoney}>
                            Balance: ${statement.money}
                        </ZIPText>
                    )}
                </View>
            </View>
            
            {statement.desc && (
                <ZIPText style={styles.statementDesc}>{statement.desc}</ZIPText>
            )}
            
            <View style={styles.statementFooter}>
                {statement.channel && (
                    <View style={styles.channelBadge}>
                        <ZIPText style={styles.channelText}>{statement.channel}</ZIPText>
                    </View>
                )}
                <ZIPText style={styles.statementId}>ID: {statement.statementId}</ZIPText>
            </View>
        </View>
    );

    const renderContent = () => {
        if (statementsLoading && !refreshing) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                    <ZIPText style={styles.loadingText}>Loading statements...</ZIPText>
                </View>
            );
        }

        if (statementsError) {
            return (
                <View style={styles.errorContainer}>
                    <Icon name="error-outline" size={80} color="#f44336" />
                    <ZIPText style={styles.errorTitle}>Error Loading Statements</ZIPText>
                    <ZIPText style={styles.errorText}>{statementsError}</ZIPText>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchStatements}>
                        <ZIPText style={styles.retryButtonText}>Retry</ZIPText>
                    </TouchableOpacity>
                </View>
            );
        }

        if (!statements || statements.length === 0) {
            return renderEmptyState();
        }

        return (
            <ScrollView
                style={styles.statementsList}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#4CAF50']}
                    />
                }
            >
                {statements.map((statement, index) => renderStatementItem(statement, index))}
            </ScrollView>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {renderTypeSelector()}
            
            <View style={styles.content}>
                {renderContent()}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    typeSelector: {
        flexDirection: 'row',
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    typeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginHorizontal: 4,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
    },
    typeButtonActive: {
        backgroundColor: '#4CAF50',
    },
    typeButtonText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 6,
        fontWeight: '500',
    },
    typeButtonTextActive: {
        color: 'white',
    },
    content: {
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#f44336',
        marginTop: 16,
        marginBottom: 8,
    },
    errorText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    statementsList: {
        flex: 1,
        padding: 16,
    },
    statementItem: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    statementHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    statementInfo: {
        flex: 1,
        marginRight: 12,
    },
    statementTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    statementDate: {
        fontSize: 12,
        color: '#666',
    },
    amountContainer: {
        alignItems: 'flex-end',
    },
    statementAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    statementMoney: {
        fontSize: 12,
        color: '#666',
    },
    statementDesc: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
        lineHeight: 20,
    },
    statementFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    channelBadge: {
        backgroundColor: '#e3f2fd',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    channelText: {
        fontSize: 12,
        color: '#1976d2',
        fontWeight: '500',
    },
    statementId: {
        fontSize: 12,
        color: '#999',
    },
});

export default Statement;