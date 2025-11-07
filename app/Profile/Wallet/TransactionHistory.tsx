import React from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import ZIPText from '@/components/ZIPText';

const TransactionHistory: React.FC = () => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <ZIPText style={styles.title}>Transaction History</ZIPText>
                <ZIPText style={styles.subtitle}>Coming soon...</ZIPText>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'black',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: 'gray',
        textAlign: 'center',
    },
});

export default TransactionHistory;