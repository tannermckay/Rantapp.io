import styles from '../../assets/styles';
import { Button, KeyboardAvoidingView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function WelcomeScreen({ navigation }) {

    return (
    <View style={styles.loginScreen}>
        <Text style={styles.loginScreenTitle}>Prompts</Text>
        <Text>Real response</Text>
        <Text>More perspective</Text>
        <Text>Deeper connection</Text>
        <Button 
            title="Next"
            onPress={() => {navigation.navigate("Explanation")}}
        />
    </View>
    );
}
