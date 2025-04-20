import React, { useState, useEffect } from 'react';
import { Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import PostCard from '../components/PostCard';
import styles from '../assets/styles';
import { app, db, storage } from '../firebaseConfig';
import { collection, getDoc, doc, getDocs, query, where } from "firebase/firestore";


export default function PostDetailsScreen({ route, navigation }) {
  const { postId } = route.params;
  // const [hashtags, setHashtags] = useState([]);

  // async function getListingHashtags (listingId) {
  //   try {
  //     const docSnap = await getDoc(doc(db, "finds", listingId));
  //     const data = docSnap.data().hashtags;
  //     const hashtagJSXArray = data.map((hashtag) => {
  //       return <Text key={hashtag}>{'#' + hashtag + ' '}</Text>
  //     })
  //     setHashtags(hashtagJSXArray);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }

  useEffect(() => {
    // getListingHashtags(postId);
  }, []);


  return (
    <ScrollView>
      <View style={styles.contentContainer}>
        <PostCard
          postId={postId}
          onPress={() => navigation.goBack()}
        />
      </View>
      {/* <View style={styles.detailCard}>
        <Text style={styles.hashtags}>
          {hashtags}
        </Text>          
      </View> */}
    </ScrollView>
  );
}