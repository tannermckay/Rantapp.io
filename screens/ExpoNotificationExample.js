import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Text, View, Image, TouchableOpacity, Button, Platform } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
// import PostThumbnail from '../components/PostThumbnail'
import styles from '../assets/styles';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { app, db, storage, auth, msg } from '../firebaseConfig';
import { signOut } from "firebase/auth";
import { collection, getDoc, getDocs, query, where, doc } from "firebase/firestore";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { getTodayDate } from '../api/utilities';
import PostPreview from '../components/PostPreview';
import { useFocusEffect } from '@react-navigation/native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from "expo-constants";

// NOTICE: MUST REGISTER APP WITH APPLE DEVELOPER ACCOUNT IN ORDER TO MAKE THIS WORK


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});


// Can use this function below or use Expo's Push Notification Tool from: https://expo.dev/notifications
async function sendPushNotification(expoPushToken) {
  console.log("pressed")
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Original Title',
    body: 'And here is the body!',
    data: { someData: 'goes here' },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}

async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
     token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig.extra.eas.projectId,
      }))
    console.log(token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {setExpoPushToken(token.data.substring(token.data.indexOf('[') + 1, token.data.indexOf(']') + 1)); console.log(token.data.substring(token.data.indexOf('[') + 1, token.data.indexOf(']') + 1))});

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-around' }}>
      <Text>Your expo push token: {expoPushToken}</Text>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text>Title: {notification && notification.request.content.title} </Text>
        <Text>Body: {notification && notification.request.content.body}</Text>
        <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
      </View>
      <Button
        title="Press to Send Notification"
        onPress={async () => {
          await sendPushNotification(expoPushToken);
        }}
      />
    </View>
  );
}


// export default function ProfileScreen({ navigation }) {
//   const [postPreviews, setPostPreviews] = useState([]);
//   const [userInfo, setUserInfo] = useState({});

//   async function getUserInfo(userId) {
//     try{
//       let userInfoResult = await getDoc(doc(db, "profile", userId));
//       setUserInfo(userInfoResult.data());
//     } catch(e) {
//       console.log(e)
//     }
//   };

//   async function getPostPreviews(userId) {
//     const querySnapshot = await getDocs(collection(db, "profile", userId, "post"));
//     const postPreviewsArray = [];
//     for await (const doc of querySnapshot.docs) {
//       const questionOfTheDay = await getQuestionOfTheDay(doc.id);
//       postPreviewsArray.push({id: doc.id, question: questionOfTheDay, data: doc.data()});
//     };
//     setPostPreviews(postPreviewsArray)
//   };

//   async function getQuestionOfTheDay(date) {
//     const formattedDate = new Date(date).toISOString().split('T')[0];
//     const questionDoc = await getDoc(doc(db, "question", formattedDate));
//     return questionDoc.data().question;
//   };

//   function LogoutUser() {
//     signOut(auth).catch((error) => {
//       // An error happened.
//       console.log(error.code + ' ' + error.message);
//     });
//   }

  

//   useFocusEffect(
//     useCallback(() => {
//       getUserInfo(auth.currentUser.uid);
//       getPostPreviews(auth.currentUser.uid);
//     }, [])
//   );


//   return (
//       <ScrollView>
//         <View style={styles.profileCard}>
//           <TouchableOpacity
//             style={styles.editButton}
//             onPress={() => {LogoutUser()}}
//             activeOpacity={0.5}
//           >
//             <Text>Logout</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.editButton}
//             onPress={() => navigation.navigate('EditProfile')}
//             activeOpacity={0.5}
//           >
//             <FontAwesomeIcon
//               icon={[ 'fas', 'pen' ]}
//               size={ 20 }
//               color='black'
//             />
//           </TouchableOpacity>
//           <View style={styles.imageAndNameContainer}>
//             <Image 
//               style={styles.profileImage}
//               source={{uri: userInfo.profilePicRef}}
//             />
//             <Text style={styles.profileText}>{userInfo.firstName + " " + userInfo.lastName}</Text>
//             <Text style={styles.profileSubtext}>{userInfo.username}</Text> 
//             <Text style={styles.profileSubtext}>{userInfo.bio}</Text> 
//             {/* <Text style={styles.profileSubtext}>{locationText}</Text> */}
//           </View>
//         </View>
//         <View style={styles.allPosts}>
//           <Text>Friends {userInfo.friends ? userInfo.friends.length : ''}</Text>
//           <Button title="View All" onPress={() => navigation.navigate('Friends', {
//             friendList: userInfo.friends
//           })}/>
//         </View>
//         <View style={styles.allPosts}>
//           <TouchableOpacity 
//             style={styles.postThumbnail} 
//             activeOpacity={0.5}
//             onPress={() => navigation.navigate('CreatePost')}  
//           >
//               <FontAwesomeIcon
//                 icon={[ 'fas', 'plus' ]}
//                 size={ 40 }
//                 color='white'
//               />
//           </TouchableOpacity>
//           { postPreviews.length == 0 ? 
//           <Text>Go save some posts!</Text> :
//           postPreviews.map((post) => {
//             return (
//               <PostPreview
//                 key={post.id}
//                 videoSrc={post.data.videoRef}
//                 description={post.data.description}
//                 questionOfTheDay={post.question}
//                 // imgSrc={{uri: post.data.image}}
//                 onPress={() => navigation.navigate('PostDetails', {
//                   postId: post.id
//                 })}
//               />)
//           })
//           }
//         </View>      
//       </ScrollView>
//   );
// }


// style={{ height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}