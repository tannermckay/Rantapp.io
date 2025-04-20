// Import packages
import React, { useEffect, useState, } from "react";
import { Dimensions, SafeAreaView, View, Text, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";
// navigation stuff
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { TabBar } from './components/TabBar';
// Screens
import LoginScreen from "./screens/Login";
import ProfileScreen from "./screens/Profile";
import CreatePostScreen from "./screens/CreatePost";
import PostDetailsScreen from "./screens/PostDetails";
import ConnectionScreen from "./screens/Connections";
import WelcomeScreen from "./screens/Onboarding/Welcome";
import ExplanationScreen from "./screens/Onboarding/Explanation";
import EditProfileScreen from "./screens/Profile/EditProfile";
import FeedScreen from "./screens/Feed";
// Font and Icon Assets
import * as Font from "expo-font";
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';

// create icon library to be used throughout app
library.add(fas, far);

// create tab navigator
const Tab = createMaterialTopTabNavigator();

// Create navigation stack
const Stack = createNativeStackNavigator();

// Create login-substack
function LoginStack() {
  return(
    <Stack.Navigator
      initialRouteName="Welcome"
      headerMode='none'
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Explanation" component={ExplanationScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

// Create Profile-substack
function ProfileStack() {
  return (
    <Stack.Navigator
      initialRouteName={"Profile"}
      headerMode='none'
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Connections" component={ConnectionScreen} />
      <Stack.Screen name="PostDetails" component={PostDetailsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUser(user);
    })
  }, []);

  

  // Load fonts
  let [fontsLoaded] = useFonts({
    "Inter-Thin": require("./assets/fonts/Inter-Thin.otf"),
    "Inter-Light": require("./assets/fonts/Inter-Light.otf"),
    "Inter-Regular": require("./assets/fonts/Inter-Regular.otf"),
    "Inter-Medium": require("./assets/fonts/Inter-Medium.otf"),
    "Inter-SemiBold": require("./assets/fonts/Inter-SemiBold.otf"),
    "Inter-Bold": require("./assets/fonts/Inter-Bold.otf"),
    "Inter-Black": require("./assets/fonts/Inter-Black.otf"),

    //"Merriweather-Bold": require("./assets/fonts/Merriweather-Bold.ttf"),
    //"Merriweather-Black": require("./assets/fonts/Merriweather-Black.ttf"),

  });

  if (!fontsLoaded /*|| !isLoadingComplete*/) {
    return null;
  } else {
    return (
      <GestureHandlerRootView style={styles.appContainer}>
        <SafeAreaProvider>
            <NavigationContainer style={styles.appContainer}>
                { user ?
                (
                  <Tab.Navigator
                    tabBar={props => <TabBar {...props} />}
                    initialRouteName={"Feed"}
                    tabBarPosition="bottom"
                    tabBarShowIcon="true"       
                  >
                    <Tab.Screen
                      name="Feed"
                      component={FeedScreen}
                    />
                    <Tab.Screen 
                      name="CreatePost" 
                      component={CreatePostScreen} 
                    />
                    <Tab.Screen
                      name="Profile"
                      component={ProfileStack}
                    />
                  </Tab.Navigator>
                ) : (
                  <Stack.Navigator
                    initialRouteName="Login"
                    screenOptions={{
                      headerShown: false,
                    }}
                    
                  >
                    <Stack.Screen
                      name="Login"
                      component={LoginStack}
                    />
                  </Stack.Navigator>
                )}
            </NavigationContainer>
          </SafeAreaProvider>
        </GestureHandlerRootView>    
    );
  }
}

// Use loaded in fonts
function useFonts(fontMap) {
  let [fontsLoaded, setFontsLoaded] = useState(false);
  (async () => {
    await Font.loadAsync(fontMap);
    setFontsLoaded(true);
  })();
  return [fontsLoaded];
}