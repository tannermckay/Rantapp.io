import styles from '../../assets/styles';
import { Button, KeyboardAvoidingView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function ExplanationScreen({ navigation }) {

    return (
    <View style={styles.loginScreen}>
        <Text style={styles.loginScreenTitle}>One Question Daily</Text>
        <Text>20 seconds to respond</Text>
        <Button 
            title="Next"
            onPress={() => {navigation.navigate("Login")}}
        />
    </View>
    );
}
