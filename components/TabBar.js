import { BlurView } from 'expo-blur';
import { Animated, View, TouchableOpacity } from 'react-native';
import styles from '../assets/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

export function TabBar({ state, descriptors, navigation, position }) {
    const insets = useSafeAreaInsets();
  return (
    <BlurView intensity={50} tint='dark' style={[ styles.tabBar, {
        // Paddings to handle safe area
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }
    ]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const iconName = route.name == 'Feed' ? 'square' :
                            route.name == 'Profile' ? 'user' :
                            route.name == 'CreatePost' ? 'square-plus' : 'cog';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            // The `merge: true` option makes sure that the params inside the tab screen are preserved
            navigation.navigate({ name: route.name, merge: true });
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const inputRange = state.routes.map((_, i) => i);
        const opacity = position.interpolate({
          inputRange,
          outputRange: inputRange.map(i => (i === index ? 1 : 0.5)),
        });

        return (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabBarButton}
            activeOpacity={0.8}
          >
            <Animated.View style={[styles.tabButtonContent, { opacity: opacity }]}>
                {/* {label} */}
                <FontAwesomeIcon
                    icon={[ 'far', iconName ]}
                    size={ 20 }
                    color='white'
                />
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </BlurView>
  );
}