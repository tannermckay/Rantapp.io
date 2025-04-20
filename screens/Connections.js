import { ScrollView, Text, View, Image, TouchableOpacity, Button, TextInput } from 'react-native';
import React, { useState, useEffect } from 'react';
import styles from '../assets/styles';
import { getDoc, getDocs, query, collection, where, setDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import ConnectionPreview from '../components/ConnectionPreview';

export default function ConnectionScreen({ navigation }) {
    const [connections, setConnections] = useState([]);
    const [username, setUsername] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    async function getConnections() {
        let connectionComponentsArray = [];
        const connectionDocs = await getDocs(collection(db, "profile", auth.currentUser.uid, "connection"));
        connectionIdList = [];
        connectionComponentInfo = [];
        connectionDocs.forEach(doc => {
            connectionIdList.push(doc.id);
            connectionComponentInfo.push(
                {
                    userId: doc.id,
                    status: doc.data().status,
                    direction: doc.data().direction,
                }
            );
        });
        const connectionProfilesDocs = await getDocs(query(collection(db, "profile"), where('__name__', "in", connectionIdList)));
        connectionProfilesDocs.forEach(doc => {
            let connectionToEdit = connectionComponentInfo.find(connection => {
                return connection.userId === doc.id;
              })
            connectionToEdit.profile = doc.data();
        });
        setConnections(connectionComponentInfo);
        // console.log(connectionComponentInfo)
    }

    async function searchProfiles(username) {
        await getDocs(query(collection(db, "profile"), where("username", "==", username))).then((result) => {
            if (!result.empty) {
                const items = result.docs.map((result) => {return {
                        id: result.id,
                        data: result.data()
                }});
                setSearchResults(items);
                console.log(items);
            }
            else {
                setSearchResults([]);
                console.log("No such user!");
            }
        });
    }

    async function addConnection(userId) {
        // create connection doc in current user
        await setDoc(doc(db, "profile", auth.currentUser.uid, "connection", userId),
        {
            direction: "outgoing",
            status: "requested",
        }).catch((error) => {
            console.log(error);
        });
        // create connection doc in requested user
        await setDoc(doc(db, "profile", userId, "connection", auth.currentUser.uid),
        {
            direction: "incoming",
            status: "requested",
        }).catch((error) => {
            console.log(error);
        });
        getConnections();
    }

    async function approveConnection(userId) {
        console.log(userId)
        // update connection doc in current user
        await updateDoc(doc(db, "profile", auth.currentUser.uid, "connection", userId),
        {
            status: "approved",
        }).catch((error) => {
            console.log(error);
        });
        // update connection doc in requested user
        await updateDoc(doc(db, "profile", userId, "connection", auth.currentUser.uid),
        {
            status: "approved",
        }).catch((error) => {
            console.log(error);
        });
        getConnections();
    }

    async function denyConnection(userId) {
        // update connection doc in current user
        await updateDoc(doc(db, "profile", auth.currentUser.uid, "connection", userId),
        {
            status: "denied",
        }).catch((error) => {
            console.log(error);
        });
        // update connection doc in requested user
        await updateDoc(doc(db, "profile", userId, "connection", auth.currentUser.uid),
        {
            status: "denied",
        }).catch((error) => {
            console.log(error);
        });
        getConnections();
    }

    useEffect(() => {
        getConnections();
    }, []);

    return (
        <ScrollView>
            <View style={styles.profileCard}>
                <Text>Search for a connection</Text>
                <TextInput
                    value={username}
                    onChangeText={(newInput) => {setUsername(newInput); searchProfiles(newInput.toLowerCase());}}
                    placeholder="Username"
                    autoCompleteType='on'
                />
                {searchResults[0] ?
                <View>
                    <Text>{searchResults[0].data.firstName}</Text>
                    <Button
                        title="Connect"
                        onPress={() => {addConnection(searchResults[0].id)}}
                    />
                </View>
                : <Text>No results</Text>
                }
                
            </View>
            <View style={styles.profileCard}>
                <Text>Requests</Text>
                {connections.filter(
                    (connection) => {
                        return connection.status == "requested"
                    }
                ).map((connection) => 
                    <ConnectionPreview
                        key={connection.userId}
                        status={connection.status}
                        direction={connection.direction}
                        profile={connection.profile}
                        handleApproveConnection={() => {approveConnection(connection.userId)}}
                        handleDenyConnection={() => {denyConnection(connection.userId)}}
                    />
                )}
                <Text>Connections</Text>
                {connections.filter(
                    (connection) => {
                        return connection.status !== "requested"
                    }
                ).map((connection) => 
                    <ConnectionPreview
                        key={connection.userId}
                        status={connection.status}
                        direction={connection.direction}
                        profile={connection.profile}
                        handleApproveConnection={() => {approveConnection(connection.userId)}}
                        handleDenyConnection={() => {denyConnection(connection.userId)}}
                    />
                )}
            </View>
        </ScrollView>
    )
}