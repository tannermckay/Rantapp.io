import * as React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { CARD_BACKGROUND, BACKGROUND_COLOR, LIGHT_COLOR, BORDER_RADIUS, PRIMARY_COLOR } from '../assets/styles';

export default function BlurButton({ onPress, text, icon, iconSize=20, iconColor=LIGHT_COLOR, blurIntensity=50, fontSize=20, style, textColor=LIGHT_COLOR }) {
    const styles = StyleSheet.create({
        buttonBlur: {
            flexDirection: 'row',
            backgroundColor: CARD_BACKGROUND,
            alignItems: 'flex-start',
            borderRadius: BORDER_RADIUS,
            overflow: 'hidden',
            borderTopColor: 'rgba(100, 100, 100, 0.20)',
            borderTopWidth: 1,
            borderLeftColor: 'rgba(100, 100, 100, 0.20)',
            borderLeftWidth: 1,
            borderBottomColor: 'rgba(50, 50, 50, 0.20)',
            borderBottomWidth: 1,
            borderRightColor: 'rgba(50, 50, 50, 0.20)',
            borderRightWidth: 1,
        },
        blurButtonTouchableOpacity: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 20,
            paddingHorizontal: 20,
            gap: 10,
        },
        blurButtonText: {
            color: textColor,
            fontFamily: 'Inter-Black',
        },
    });

    return (
        <BlurView intensity={blurIntensity} tint='dark'
            style={[styles.buttonBlur]}
        >
            <TouchableOpacity
                style={[styles.blurButtonTouchableOpacity, style]}
                onPress={onPress}
                activeOpacity={0.8}
            >
                { text ?
                <Text style={[styles.blurButtonText, {fontSize: fontSize}]}>
                    {text}
                </Text>
                : undefined }
                { icon ?
                <FontAwesomeIcon
                    icon={ icon }
                    size={ iconSize }
                    color={ iconColor }
                /> :
                undefined
                }
            
            </TouchableOpacity>
        </BlurView>
    );
}

