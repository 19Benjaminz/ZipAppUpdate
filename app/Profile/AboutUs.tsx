import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import ZIPText from '@/components/ZIPText';

const AboutUs: React.FC = () => {
    return (
        <View style={styles.container}>
            <Image
                style={styles.headerImage}
                source={require('../../assets/images/aboutusheader.png')}
                resizeMode="cover"
            />
            <ZIPText style={styles.text}>
                {'ZipcodeXpress Inc., ' +
                    'based in Austin TX, specializes in total ' +
                    'smart-locker solution with cutting edge intelligent' +
                    ' smart-locker products and cloud-based software system. ' +
                    'Our goal is to provide our customer with faster, more secure ' +
                    'and lower-cost logistics service to make your life ' +
                    'easier with great happiness.'}
            </ZIPText>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'white',
    },
    headerImage: {
        width: '100%',
        height: 180,
    },
    text: {
        padding: 8,
        color: '#000', // Replace with Color.titleColor if defined
        lineHeight: 18,
    },
});

export default AboutUs;
