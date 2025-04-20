import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Text, View, Image, TouchableOpacity, Button, Platform } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
// import PostThumbnail from '../components/PostThumbnail'
import styles from '../assets/styles';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { app, db, storage, auth, msg } from '../firebaseConfig';
import { signOut } from "firebase/auth";
import { collection, getDoc, getDocs, query, where, doc, getCountFromServer } from "firebase/firestore";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { getTodayDate } from '../api/utilities';
import PostPreview from '../components/PostPreview';
import { useFocusEffect } from '@react-navigation/native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from "expo-constants";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { ActivityIndicator } from 'react-native';

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [postPreviews, setPostPreviews] = useState([]);
  const [userInfo, setUserInfo] = useState({});
  const [connectionCount, setConnectionCount] = useState(0);
  const [showPreviewsLoading, setShowPreviewsLoading] = useState(true);

  async function redirectIfNewUser(userId) {
    const result = await getDoc(doc(db, "profile", userId))
    console.log(!result.exists())
    console.log(result.data())
    if (!result.exists()) {
      navigation.navigate('EditProfile');
    }
  }

  async function getUserInfo(userId) {
    try{
      let userInfoResult = await getDoc(doc(db, "profile", userId));
      setUserInfo(userInfoResult.data());
    } catch(e) {
      console.log(e)
    }
  };

  async function getConnectionsCount(userId) {
    const coll = collection(db, "profile", userId, "connection");
    const result = await getCountFromServer(coll);
    setConnectionCount(result.data().count)
  }

  async function getPostPreviews(userId) {
    const querySnapshot = await getDocs(collection(db, "profile", userId, "post"));
    const postPreviewsArray = [];
    for await (const doc of querySnapshot.docs) {
      const questionOfTheDay = await getQuestionOfTheDay(doc.id);
      postPreviewsArray.push({id: doc.id, question: questionOfTheDay, data: doc.data()});
    };
    setPostPreviews(postPreviewsArray);
    setShowPreviewsLoading(false);
  };

  async function getQuestionOfTheDay(date) {
    const formattedDate = new Date(date).toISOString().split('T')[0];
    const questionDoc = await getDoc(doc(db, "question", formattedDate));
    return questionDoc.data().question;
  };

  function LogoutUser() {
    signOut(auth).catch((error) => {
      // An error happened.
      console.log(error.code + ' ' + error.message);
    });
  }

  useFocusEffect(
    useCallback(() => {
      getUserInfo(auth.currentUser.uid);
      getPostPreviews(auth.currentUser.uid);
      getConnectionsCount(auth.currentUser.uid);
    }, [])
  );

  useEffect(() => {
    redirectIfNewUser(auth.currentUser.uid);
  }, []);

  return (
      <ScrollView style={[styles.pageContainer, {
        // Paddings to handle safe area
        paddingTop: insets.top ? insets.top : 10,
        paddingBottom: insets.bottom ? insets.bottom : 10,
        paddingLeft: insets.left ? insets.left : 10,
        paddingRight: insets.right ? insets.right : 10,
      }]}>
        <View style={styles.topRow}>
          <View style={styles.usernameGroup}>
            <Text style={styles.logo}>P.</Text>
            <Text style={styles.username}>@{userInfo.username}</Text>
          </View>
          <View style={styles.editButtonGroup} >
            <TouchableOpacity
              style={styles.icon}
              onPress={() => navigation.navigate('EditProfile')}
              activeOpacity={0.6}
            >
              <FontAwesomeIcon
                icon={[ 'fas', 'pen-to-square' ]}
                size={ 20 }
                color='white'
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.icon}
              onPress={() => {LogoutUser()}}
              activeOpacity={0.5}
            >
              <FontAwesomeIcon
                icon={[ 'fas', 'right-from-bracket' ]}
                size={ 20 }
                color='white'
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.profilePics}>
          { (userInfo.profilePicRefs && userInfo.profilePicRefs[0]) ?
            ( <Image
            key={userInfo.profilePicRefs[0]}
            style={[styles.profileImage, styles.mainProfileImage]}
            source={{uri: userInfo.profilePicRefs[0]}}
            />  )
           : <View style={[styles.profileImagePlaceholder, styles.mainProfileImage]}></View>
           }
          <View style={styles.imagesNameBio}>
            <View style={styles.secondaryProfileImages}>
            { userInfo.profilePicRefs && userInfo.profilePicRefs[1] ?
              <Image
                key={userInfo.profilePicRefs[1]}
                style={[styles.profileImage, {flex: 1.5}]}
                source={{uri: userInfo.profilePicRefs[1]}}
              /> : <View style={styles.profileImagePlaceholder}></View>}
            { userInfo.profilePicRefs && userInfo.profilePicRefs[2] ? 
              <Image
                key={userInfo.profilePicRefs[2]}
                style={styles.profileImage}
                source={{uri: userInfo.profilePicRefs[2]}}
              /> : <View style={styles.profileImage}></View>}
            </View>
            <TouchableOpacity 
              style={styles.connectionsCard}
              onPress={() => {navigation.navigate('Connections')}}
              activeOpacity={0.8}
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
                  <Text style={styles.connectionCount}>{connectionCount}</Text>
                </View>
              </View>
              <View style={styles.connectionsBottomRow}>
                <View style={styles.connectionsPreviewImages}>
                  {[0,1,2,3,4].map((key) => {
                    return <View key={key} style={styles.connectionsPreviewImage}></View>
                  })}
                  <FontAwesomeIcon
                    icon={[ 'fas', 'plus' ]}
                    size={ 18 }
                    color='white'
                  />
                </View>
                
              </View>
            </TouchableOpacity>
          </View>
          
        </View>
        <View style={styles.profileDetails}>
          <Text style={styles.displayName}>{userInfo.displayName}</Text>
          <Text numberOfLines={2} style={styles.bio}>{userInfo.bio}</Text>
        </View>
        <View style={styles.postPreviews}>
          {
            showPreviewsLoading ? 
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', height: '100%',}}>
              <BlurView intensity={50} tint='dark' style={[styles.modalView, styles.postingModal ]}>
                <ActivityIndicator size="large" color="white"/>
                <Text style={styles.postingModalText}>getting{'\n'}posts</Text>
              </BlurView>
            </View> : 
            postPreviews.length == 0 ? 
              <View style={styles.noPostsCard}>
                <Text style={styles.noPostsText}>You don't have any posts yet:(</Text>
              </View> :
              postPreviews.map((post) => {
                return (
                  <PostPreview
                    key={post.id}
                    thumbnailSrc={post.data.thumbnailRef}
                    // description={post.data.description}
                    questionOfTheDay={post.question}
                    onPress={() => navigation.navigate('PostDetails', {
                      postId: post.id
                    })}
                  />)
              })
          }
          
        </View>      
      </ScrollView>
  );
}


// style={{ height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}