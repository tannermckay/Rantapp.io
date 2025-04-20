import React, { useState, useEffect } from 'react';
import { Dimensions, Text, View, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import styles from '../assets/styles';
import { app, auth, db, storage } from '../firebaseConfig';
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { Video } from 'expo-av';

export default function PostCard({
  postId,
  onPress
}) {
  const [post, setPost] = useState({});

  async function getPostData(postId) {
    try {
      const docSnap = await getDoc(doc(db, "profile", auth.currentUser.uid, "post", postId));
      console.log(docSnap.data())
      setPost(docSnap.data());
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    getPostData(postId);
  }, []);


  return (

        <Video
          style={styles.postCard}
          source={{uri: post.videoRef}}
          useNativeControls
          resizeMode='contain'
          shouldPlay
        >
          <LinearGradient
            colors={['rgba(0,0,0,.3)',  'rgba(0,0,0,.1)', 'transparent']}
            locations={[0.0, 0.85, 1.0]}
            style={styles.postSeller}
          >
            <Image
              source={{uri: post.sellerProfilePic}}
              style={styles.postSellerProfileImage}
            />
            <Text style={styles.postSellerName}>
              {post.sellerName}
            </Text>
          </LinearGradient>
          <View style={styles.postOverlay}>
            <LinearGradient
              colors={['transparent',  'rgba(0,0,0,1)', 'rgba(0,0,0,1)']}
              locations={[0.0, 0.85, 1.0]}
              style={styles.opaqueGradient}
            >
            </LinearGradient>
            <View style={styles.postTextGroup}>
              {/* <Text style={styles.postBrandText}>
                {post.brand}
              </Text> */}
              <Text style={styles.postBigText}>
                {post.videoRef}
              </Text>
              <Text style={styles.postDescription}>
                {post.description}
              </Text>
              {/* <Text style={styles.postPrice}>
                {'$' + post.price}
              </Text> */}
              {/* <Text style={styles.postSize}>
                {post.size}
              </Text> */}
            </View>
          </View>
        </Video>
  );
}


