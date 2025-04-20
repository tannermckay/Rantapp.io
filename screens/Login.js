import React, { useState, Component, useEffect, useRef } from 'react';
import { app, db, storage, auth } from '../firebaseConfig';
import styles from '../assets/styles';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { Button, KeyboardAvoidingView, StyleSheet, Text, TextInput, View } from 'react-native';
import { setDoc, doc } from 'firebase/firestore';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    function CreateUser(email, password) {
        // console.log("Attempted to create user");
        createUserWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                // Signed in
                const profileDetails =
                {
                    username: auth.currentUser.email,
                    profilePicRef: '',
                }
                await setDoc(doc(db, "profile", auth.currentUser.uid), profileDetails);
                console.log("Created user");
                // navigation.navigate('AddProfileDetails');
                // console.log(userCredential.user);
            })
            .catch((error) => {
                if (error.code == "auth/weak-password") {
                    setErrorMessage(<Text>Weak Password. Password should be at least 8 characters.</Text>);
                } else {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.log(errorCode + errorMessage);
                }
            });
    }

    // Tries to login user, and handles resulting errors 
    function LoginUser(email, password) {
        // console.log("attempted to login user")
        setErrorMessage("");
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in
                // navigation.navigate('Profile');
                // console.log(userCredential.user);
            })
            .catch((error) => {
                if (error.code == "auth/invalid-email") {
                    setErrorMessage(<Text>Invalid Email. Please try a different email.</Text>);
                } else if (error.code == "auth/user-disabled") {
                    setErrorMessage(<Text>Account is disabled. Please try again later.</Text>);
                } else if (error.code == "auth/user-not-found") {
                    // if the user doesn't exist, create a new user with the email
                    CreateUser(email, password);
                }
                else if (error.code == "auth/wrong-password") {
                    setErrorMessage(<Text>Wrong password. Please try again.</Text>);
                } else {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.log(errorCode + errorMessage);
                }
            });

    }

    return (
    <View style={styles.loginScreen}>
        <KeyboardAvoidingView behavior="padding">
            <Text style={styles.loginScreenTitle}>Signup or Login</Text>
            <TextInput
                style={styles.loginFormInput}
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                keyboardType='email-address'
                autoCompleteType='on'
            />
            <TextInput
                style={styles.loginFormInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry={true}
            />
            { errorMessage }
            <View style={styles.loginFormButtons}>
                <Button 
                    title="Login"
                    onPress={() => {LoginUser(email, password)}}
                />
            </View>
        </KeyboardAvoidingView>
    </View>
    );
}
