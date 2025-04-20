import React, { useState, useEffect } from 'react';
import { Button, ScrollView, Text, View } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, query, getDocs, collection, getDoc, where, and } from '@firebase/firestore';
import { Video } from 'expo-av';
import styles from '../assets/styles';

export default function FeedScreen({ navigation }) {
    const [posts, setPosts] = useState([]);
    const [question, setQuestion] = useState("");

    async function redirectIfNewUser(userId) {
        const result = await getDoc(doc(db, "profile", userId))
        console.log(!result.exists())
        console.log(result.data())
        if (!result.exists()) {
          navigation.navigate('EditProfile');
        }
      }

    async function getQuestion() {
        const questionDoc = await getDoc(doc(db, "question", new Date().toISOString().split('T')[0]));
        setQuestion(questionDoc.data().question);
    };

    async function getPosts() {
        const today = new Date().toISOString().split('T')[0];
        // console.log(today)
        let postsArray = [];

        // get list of current user's connections
        const connectionList = await getDocs(query(collection(db, "profile", auth.currentUser.uid, "connection"), where ("status", "==", "approved")));
        if (!connectionList.empty) {
            // console.log("Current user's connections docs list:", connectionList.docs);
            // for each connection, get their posts for today
            for await (const connection of connectionList.docs) {
                // console.log("Connection doc: ", connection);
                const postQueryResults = await getDocs(query(collection(db, "profile", connection.id, "post"),
                    and(
                        where("__name__", ">=", today),
                        where("__name__", "<=", today + '~')
                    )));
                // console.log("Connection ID: ", connection.id, "     Posts from connection: ", postQueryResults.docs);

                // get connection's user info
                const userInfo = await getDoc(doc(db, "profile", connection.id));
                // console.log("Connection userInfo: ", userInfo);

                postQueryResults.docs.map((post) => {
                    // add data to end of array for display
                    postsArray.push({
                        id: connection.id,
                        userInfo: userInfo.data(),
                        postInfo: post.data(),
                    });
                });
            };
            // console.log("posts: ", postsArray);
            setPosts(postsArray);
        }
        else {
            console.log("No posts to show!");
        };
    }

    useEffect(() => {
        getPosts();
        getQuestion();
        redirectIfNewUser(auth.currentUser.uid);
    }, []);

    return (
        <ScrollView>
            <Text>{question}</Text>
            <Button title="refresh" onPress={() => {getPosts()}}/>
            {posts ? posts.map((post) => {
                return (
                    <View key={post.id} style={styles.feedPostCard}>
                        <Text>{post.userInfo.username}</Text>
                        <Text>{post.postInfo.description}</Text>
                        <Video
                            style={styles.feedPostVideo}
                            source={{uri: post.postInfo.videoRef}}
                            useNativeControls
                            resizeMode='contain'
                        />
                    </View>
                )
            }) : <Text>No posts to see!</Text>}
        </ScrollView>
    );
}