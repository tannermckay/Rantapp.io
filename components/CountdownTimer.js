import { useCountdown } from "react-native-countdown-circle-timer";
import { Text, View } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import styles from "../assets/styles";

export function CountdownTimer({ duration, colors, isPlaying, onComplete, onUpdate }) {
    const timer = useCountdown({
      isPlaying: isPlaying,
      duration: duration,
      colors: colors,
      updateInterval: 1,
      onComplete: onComplete,
      onUpdate: onUpdate,
    });

    return (
      <View style={styles.timerTextGroup}>
        <FontAwesomeIcon
          icon={[ 'far', 'clock' ]}
          size={38}
          color={'white'}
        />
        <Text style={styles.timerText}>{timer.remainingTime}s</Text>        
      </View>

    )
}