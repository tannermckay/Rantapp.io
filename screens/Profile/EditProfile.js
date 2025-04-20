import React, { useState, Component, useEffect, useRef, } from 'react';
import { Button, Image, KeyboardAvoidingView, StyleSheet, Text, TextInput, View, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { app, db, storage, auth } from '../../firebaseConfig';
import styles from '../../assets/styles';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { setDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from 'expo-image-manipulator'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import BlurButton from '../../components/BlurButton';
import PostPreview from '../../components/PostPreview';
import { BlurView } from 'expo-blur';

export default function EditProfileScreen({ navigation }) {
    const [userInfo, setUserInfo] = useState({});
    const [usernameErrorMessage, setUsernameErrorMessage] = useState('Please enter a username');
    const [image, setImage] = useState(null);
    const [showLoading, setShowLoading] = useState(false);

    const insets = useSafeAreaInsets();

    async function getUserInfo(userId) {
        try{
          let userInfoResult = await getDoc(doc(db, "profile", userId));
          setUserInfo(userInfoResult.data());
        } catch(e) {
          console.log(e)
        }
      };

    const pickImage = async (imageIndex) => {
      // No permissions request is necessary for launching the image library
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
          uploadPhoto(result.assets[0].uri, imageIndex);
      }
    };

    const takePhoto = async (imageIndex) => {
        let result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          cameraType: ImagePicker.CameraType.front,
          quality: 1,
        });

        if (!result.canceled) {
            uploadPhoto(result.assets[0].uri, imageIndex);
        }
    };

    let handleUserInfoChange = (value, field) => {
        setUserInfo({
            ...userInfo,
            [field]: value
        });
    };

    async function uploadPhoto(photoUri, imageIndex) {
        setShowLoading(true);
        const resizedPhoto = await ImageManipulator.manipulateAsync(
            photoUri,
            [{ resize: { height: 200 } }],
            { compress: 0.4, format: 'png' },
        );
        const img = await fetch(resizedPhoto.uri);
        const bytes = await img.blob();

        const fileRef = ref(storage, auth.currentUser.uid + '/profilePics/' + 'profilePic' + imageIndex + '.png');
        const uploadResult = await uploadBytes(fileRef, bytes).then((snapshot) => {
            // blob.close();
            console.log("pic posted")
        }).catch((error) => {
            console.log(error);
        })

        const getDownloadUrlResult = await getDownloadURL(fileRef).then((url) => {
            const profilePicRefs = userInfo.profilePicRefs.map((value, index) => {
                if (index === imageIndex) {
                    return url;
                } else {
                    return value;
                }
            })
            setUserInfo({
                ...userInfo,
                profilePicRefs: profilePicRefs,
            });
             console.log("set profile pic")
             setShowLoading(false);
        }).catch((error) => {
            console.log(error);
        });
    }

    async function submitUserInfo() {
        setShowLoading(true);
        // upload post info
        await updateDoc(doc(db, "profile", auth.currentUser.uid), {
            ...userInfo,
        }).catch((error) => {
            console.log(error);
        });
        setShowLoading(false);
        navigation.navigate('Profile');
        console.log("profile info updated");
    };

    useEffect(() => {
        getUserInfo(auth.currentUser.uid);
    }, []);

    return (
        <KeyboardAvoidingView style={[styles.pageContainer, {
            // Paddings to handle safe area
            paddingTop: insets.top ? insets.top : 10,
            paddingBottom: insets.bottom ? insets.bottom : 10,
            paddingLeft: insets.left ? insets.left : 10,
            paddingRight: insets.right ? insets.right : 10,
        }]}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={showLoading}
            >
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', height: '100%',}}>
                    <BlurView intensity={50} tint='dark' style={[styles.modalView, styles.postingModal ]}>
                    <ActivityIndicator size="large" color="white"/>
                    <Text style={styles.postingModalText}>uploading</Text>
                    </BlurView>
                </View>
            </Modal>
            <View style={styles.topRow}>
                <View style={styles.usernameGroup}>
                    <Text style={styles.logo}>P.</Text>
                    <Text style={[styles.atSymbol,]}>@</Text>
                    <TextInput
                        style={[styles.username, styles.textInputField]}
                        value={userInfo.username}
                        onChangeText={newValue => handleUserInfoChange(newValue, "username")}
                        placeholder="username"
                        autoCompleteType='on'
                        maxLength={19}
                    />
                </View>
                <View style={styles.editButtonGroup} >
                    <TouchableOpacity
                        style={styles.icon}
                        onPress={() => {submitUserInfo()}}
                        activeOpacity={0.6}
                    >
                        <FontAwesomeIcon
                        icon={[ 'fas', 'floppy-disk' ]}
                        size={ 20 }
                        color='white'
                        />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.profilePics}>
                { (userInfo.profilePicRefs && userInfo.profilePicRefs[0]) ?
                <>
                    <Image
                        key={userInfo.profilePicRefs[0]}
                        style={[styles.profileImage, styles.mainProfileImage]}
                        source={{uri: userInfo.profilePicRefs[0]}}
                    />
                    <View style={[styles.pickImage, {width: 200 * 4/5, bottom: 10}]}>
                        <BlurButton
                            style={styles.pickImageButton}
                            icon={['fas', 'image']}
                            onPress={() => {pickImage(0)}}
                            blurIntensity={20}
                            />
                        <BlurButton
                            style={styles.pickImageButton}
                            icon={['fas', 'camera']}
                            onPress={() => {takePhoto(0)}}
                            blurIntensity={20}
                            />
                    </View>
                </> 
                : 
                <View style={[styles.profileImagePlaceholder, styles.mainProfileImage]}></View>
                }
                <View style={styles.imagesNameBio}>
                <View style={styles.secondaryProfileImages}>
                { userInfo.profilePicRefs && userInfo.profilePicRefs[1] ?
                    <>
                        <Image
                            key={userInfo.profilePicRefs[1]}
                            style={[styles.profileImage, {flex: 1.5}]}
                            source={{uri: userInfo.profilePicRefs[1]}}
                        />
                        <View style={[styles.pickImage, {width: 125}]}>
                            <BlurButton
                                style={styles.pickImageButton}
                                icon={['fas', 'image']}
                                onPress={() => {pickImage(1)}}
                                blurIntensity={20}
                            />
                            <BlurButton
                                style={styles.pickImageButton}
                                icon={['fas', 'camera']}
                                onPress={() => {takePhoto(1)}}
                                blurIntensity={20}
                            />
                        </View>
                    </> : 
                    <View style={styles.profileImagePlaceholder}></View>}
                { userInfo.profilePicRefs && userInfo.profilePicRefs[2] ? 
                    <>
                        <Image
                            key={userInfo.profilePicRefs[2]}
                            style={[styles.profileImage, {flex: 1}]}
                            source={{uri: userInfo.profilePicRefs[2]}}
                        />
                        <View style={[styles.pickImage, {right: 0, left: undefined, width: 90}]}>
                            <BlurButton
                                style={styles.pickImageButton}
                                icon={['fas', 'image']}
                                onPress={() => {pickImage(2)}}
                                blurIntensity={20}
                            />
                            <BlurButton
                                style={styles.pickImageButton}
                                icon={['fas', 'camera']}
                                onPress={() => {takePhoto(2)}}
                                blurIntensity={20}
                            />
                        </View>
                    </> :
                    <View style={styles.profileImagePlaceholder}></View>}
                </View>
                <View 
                    style={styles.connectionsCard}
                >
                    <View style={styles.connectionsTopRow}>
                    <Text style={styles.connectionsTitle}>
                        Connections
                    </Text>
                    <View style={styles.iconCountGroup}>
                        <FontAwesomeIcon
                        icon={[ 'fas', 'person' ]}
                        // people-group, user-group, people-pulling
                        size={ 20 }
                        color='white'
                        />
                        <Text style={styles.connectionCount}>X{/* {connectionCount} */}</Text>
                    </View>
                    </View>
                    <View style={styles.connectionsBottomRow}>
                    <View style={styles.connectionsPreviewImages}>
                    {[0,1,2,3,4].map((key) => {
                        return <View key={key} style={styles.connectionsPreviewImage}></View>
                    })}
                    </View>
                    
                    </View>
                </View>
                </View>
                
            </View>
            <View style={styles.profileDetails}>
                <TextInput
                    style={[styles.displayName, styles.textInputField,]}
                    value={userInfo.displayName}
                    onChangeText={newValue => handleUserInfoChange(newValue, "displayName")}
                    placeholder="Display Name"
                    autoCompleteType='on'
                />
                <TextInput
                    style={[styles.bio, styles.textInputField,{marginTop: 5,}]}
                    value={userInfo.bio}
                    onChangeText={newValue => handleUserInfoChange(newValue, "bio")}
                    placeholder="Bio"
                    autoCompleteType='on'
                    numberOfLines={2}
                />
            </View>
            <View style={styles.postPreviews}>
                {[0,1,2,3,4,5].map((post) => {
                return (
                    <View
                        key={post.id}
                        style={styles.postPreview}
                    />)
                })
                }
            </View>
        </KeyboardAvoidingView>

            // <Button title="pick an image from camera roll" onPress={pickImage}/>
            // <Button title="Take a photo" onPress={takePhoto}/>
            
            // {/* <Text>{usernameErrorMessage}</Text> */}
            
    );
}
