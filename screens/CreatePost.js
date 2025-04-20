import { StyleSheet, Text, TextInput, View, Button, SafeAreaView, Modal, Pressable, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { Camera } from 'expo-camera';
import { Video } from 'expo-av';
// import { shareAsync } from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { ref, uploadBytes, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from '../firebaseConfig';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { CountdownCircleTimer, useCountdown } from 'react-native-countdown-circle-timer'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from '../assets/styles';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { CountdownTimer } from '../components/CountdownTimer';
import BlurButton from '../components/BlurButton';
import * as VideoThumbnails from 'expo-video-thumbnails';
import * as ImageManipulator from 'expo-image-manipulator'


export default function CreatePost({ navigation }) {
  let cameraRef = useRef();
  const [hasCameraPermission, setHasCameraPermission] = useState();
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState();
  const [isRecording, setIsRecording] = useState(false);
  const [video, setVideo] = useState();
  const [type, setType] = useState(Camera.Constants.Type.front);
  const [postInfo, setPostInfo] = useState({});
  const [questionOfTheDay, setQuestionOfTheDay] = useState("");
  const [showIntro, setShowIntro] = useState(true);
  const [showRetakeWarning, setShowRetakeWarning] = useState(false);
  const [initialTime, setInitialTime] = useState(10);
  const [startTimer, setStartTimer] = useState(false);
  const [showRecordingIcon, setShowRecordingIcon] = useState(true);
  const [showPostingPopup, setShowPostingPopup] = useState(false);

  const insets = useSafeAreaInsets();

  const testing = false;

  // let toggleCameraType = () => {
  //   setType(type === Camera.Constants.Type.front ? Camera.Constants.Type.back : Camera.Constants.Type.front);
  // };

  let getQuestionOfTheDay = async () => {
    const formattedDate = new Date().toISOString().split('T')[0];
    const questionDoc = await getDoc(doc(db, "question", formattedDate));
    setQuestionOfTheDay(questionDoc.data().question);
  };

  let recordVideo = () => {
    console.log("recordVideo ran")
    setIsRecording(true);
    let options = {
      quality: "1080p",
      maxDuration: 20,
      mute: false
    };

    cameraRef.current.recordAsync(options).then((recordedVideo) => {
      setVideo(recordedVideo);
      setIsRecording(false);
    });
  };

  let stopRecording = () => {
    cameraRef.current.stopRecording();
    const timeout = setTimeout(() => {
      setIsRecording(false);
    }, 1000);
    clearTimeout(timeout);
  };

  let handleRetakeConfirmation = () => {
    setShowRetakeWarning(false);
    setVideo(undefined);
    setPostInfo({
      ...postInfo,
      retakeCount: postInfo.retakeCount + 1,
    });
  };

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const microphonePermission = await Camera.requestMicrophonePermissionsAsync();
      const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();

      setHasCameraPermission(cameraPermission.status === "granted");
      setHasMicrophonePermission(microphonePermission.status === "granted");
      setHasMediaLibraryPermission(mediaLibraryPermission.status === "granted");
    })();
    getQuestionOfTheDay();
    setPostInfo({retakeCount: 0})
  }, []);

  if (hasCameraPermission === undefined || hasMicrophonePermission === undefined) {
    return <Text>Requesting permissions...</Text>
  } else if (!hasCameraPermission) {
    return <Text>Permission for camera not granted.</Text>
  } else if (!hasMicrophonePermission) {
    return <Text>Permission for microphone not granted.</Text>
  }

  if (showIntro) {
    return (
      <View style={[styles.pageContainer, styles.createPostScreen, {
        // Paddings to handle safe area
        paddingTop: insets.top ? insets.top : 10,
        paddingBottom: insets.bottom ? insets.bottom : 10,
        paddingLeft: insets.left ? insets.left : 10,
        paddingRight: insets.right ? insets.right : 10,
      }]}>
        <View style={styles.createPostInstructionColumn}>
            <View style={styles.instructionsLogo}>
              <Text style={styles.logo}>P.</Text>
            </View>
            <View style={styles.postInstructions}>
              <Text style={styles.postInstructionBigText}>10 seconds to read the prompt,</Text>
              <View style={styles.postInstructionBigTextGroup}>
                <Text style={styles.postInstructionBigText}>20 seconds to answer.</Text>
                <Text style={styles.postInstructionSmallText}>don't worry, we'll press record</Text>
              </View>
            </View>
            <View style={styles.readyButtonGroup}>
                <Text style={styles.postInstructionSmallText}>ready?</Text>
                <BlurView intensity={50} tint='dark'
                  style={styles.readyButtonBlur}  
                >
                  <TouchableOpacity
                    style={styles.readyButtonTouchableOpacity}
                    onPress={() => {setShowIntro(false)}} 
                    activeOpacity={0.8}
                  >
                    <Text style={styles.readyButtonText}>
                      READY
                    </Text>
                    <FontAwesomeIcon
                      icon={[ 'fas', 'chevron-right' ]}
                      size={ 40 }
                      color='white'
                    />
                </TouchableOpacity>
              </BlurView>
            </View>
        </View>
      </View>
    )
  }

  if (video) {
    // let shareVideo = () => {
    //   shareAsync(video.uri).then(() => {
    //     setVideo(undefined);
    //   });
    // };

    let saveVideo = () => {
      MediaLibrary.saveToLibraryAsync(video.uri)
    };

    const generateThumbnail = async (videoUri) => {
      // console.log(videoUri) 
      try {
        return await VideoThumbnails.getThumbnailAsync(videoUri,
          {
            time: 500,
          }
        ).then( async (image) => {
          // console.log(image.uri);
          const resizedPhoto = await ImageManipulator.manipulateAsync(
            image.uri,
            [],
            { compress: 0.3, format: 'png' },
          );
          // console.log("in generate Thumbnail function: ", resizedPhoto.uri)
          return resizedPhoto.uri;
        })
      } catch (e) {
        console.log(e);
      }
      // console.log('got here');
    };


    async function postVideo() {
      setShowPostingPopup(true);
      const isoStringIdentifier = new Date().toISOString();
      // console.log("try this: ", await generateThumbnail(video.uri))
      // generate thumbnailpreview
      const thumbnailUri = await generateThumbnail(video.uri);
      // console.log("in postVideo function: ", thumbnailUri)
      const img = await fetch(thumbnailUri);
      const imgBytes = await img.blob();
      console.log('image prep complete')

      // upload image
      const fileRef = ref(storage, auth.currentUser.uid + '/' + isoStringIdentifier.split('T')[0] + '/' + isoStringIdentifier.split('T')[1] + '.png');
      await uploadBytesResumable(fileRef, imgBytes).then(async (snapshot) => {
          console.log("image uploaded")
      }).catch((error) => {
          console.log(error);
      })

      // prep video for upload
      const vid = await fetch(video.uri)
      const videoBlob = await vid.blob();
      console.log('video prep complete')

      // upload video, set post info doc, and then reset. 
      const storageRef = ref(storage, auth.currentUser.uid + '/' + isoStringIdentifier.split('T')[0] + '/' + isoStringIdentifier.split('T')[1] + '.mp4');
      uploadBytesResumable(storageRef, videoBlob).then(async (snapshot) => {
          // upload post info
          await setDoc(doc(db, "profile", auth.currentUser.uid, "post", isoStringIdentifier),
          {
              // description: postInfo.description,
              retakes: postInfo.retakeCount,
              videoRef: await getDownloadURL(storageRef),
              thumbnailRef: await getDownloadURL(fileRef),
          })
          setShowPostingPopup(false);
          console.log("video uploaded")
          // const resetSequence = setTimeout(() => {
          console.log("reset sequence")
          setPostInfo({});
          setVideo(undefined);
          setShowIntro(true);
          navigation.navigate('Profile');
          // }, 1000);
          // resetSequence;
          // clearTimeout(resetSequence);
      }).catch((error) => {
          // TODO add an error message
          console.log(error);
      });             
    };

    let handleDescriptionChange = (text) => {
        setPostInfo({
            ...postInfo, 
            description: text
        });
    };

    return (
      <View style={styles.pageContainer}>      
        <Video
          style={[styles.pageContainer,{
            // Paddings to handle safe area
            paddingTop: insets.top ? insets.top : 10,
            paddingBottom: insets.bottom ? insets.bottom : 10,
            paddingLeft: insets.left ? insets.left : 10,
            paddingRight: insets.right ? insets.right : 10,
          }]}
          source={{uri: video.uri}}
          useNativeControls
          resizeMode='cover'
          isLooping
          shouldPlay
        />
        <Modal
          animationType="slide"
          transparent={true}
          visible={showRetakeWarning}
          onRequestClose={() => {
            setShowRetakeWarning(false);
          }}
        >
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', height: '100%',}}>
            <BlurView intensity={50} tint='dark' style={[styles.modalView, {alignItems: 'flex-start'}]}>
              <Text style={styles.modalText}>Connections will see you pressed retake, retake anyway?</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.modalDismissButton]}
                  onPress={() => {setShowRetakeWarning(false)}}
                >
                  <Text style={styles.modalDismissText}>DISMISS</Text>
                </TouchableOpacity>
                <BlurButton
                  text="RETAKE"
                  fontSize={24}
                  icon={[ 'fas', 'arrow-rotate-left' ]}
                  onPress={() => {handleRetakeConfirmation()}}
                  textColor='#E53E3E'
                  // iconColor='#E53E3E'
                  style={{paddingHorizontal: 20, paddingVertical: 15}}
                />
              </View>
            </BlurView>
          </View>
        </Modal>
        <Modal
          animationType="slide"
          transparent={true}
          visible={showPostingPopup}
        >
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', height: '100%',}}>
            <BlurView intensity={50} tint='dark' style={[styles.modalView, styles.postingModal ]}>
              <ActivityIndicator size="large" color="white"/>
              <Text style={styles.postingModalText}>posting</Text>
            </BlurView>
          </View>
        </Modal>
        <LinearGradient colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.1)', 'transparent']} locations={[0,.8,1]} style={[styles.questionOfTheDayCard]}>
          {/* <Text style={styles.logo}>P.</Text> */}
          <Text numberOfLines={3} style={styles.questionOfTheDay}>{questionOfTheDay}</Text>
        </LinearGradient>
        <LinearGradient colors={['transparent', 'rgba(0,0,0,.3)', 'rgba(0,0,0,0.5)']} locations={[0,.3,1]} style={[styles.postRetakeButtonGroup]}>
        {/* <View style={styles.}>  */}
          {/* <Button title="Share" onPress={shareVideo} /> */}
          {/* <Text style={styles.loginScreenTitle}>Description</Text>
          <TextInput
              style={styles.loginFormInput}
              value={postInfo.description}
              onChangeText={handleDescriptionChange}
              placeholder="description"
              autoCompleteType='on'
          /> */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {setShowRetakeWarning(true);}}
            style={styles.retakeButton}
          >
            <View style={styles.retakeTextGroup}>
              <Text style={styles.retakeText}>
                RETAKE
              </Text>
              <Text style={styles.retakeSubtext}>
                {postInfo.retakeCounter ? postInfo.retakeCounter : 0} RETAKES
              </Text>
            </View>
            <FontAwesomeIcon
                icon={[ 'fas', 'arrow-rotate-left' ]}
                size={ 25 }
                color='white'
            />
          </TouchableOpacity>
          <View style={styles.postButton}>
            <BlurButton 
              text="POST"
              onPress={postVideo}
              icon={['far', 'paper-plane']}
              iconSize={40}
              fontSize={40}
            />
          </View>
          {/* {hasMediaLibraryPermission ? <Button title="Save to Media Library" onPress={saveVideo} /> : undefined} */}
        </LinearGradient>
      </View>

    );
  }

  return (
    <Camera ref={cameraRef} type={type} style={[styles.pageContainer, styles.createPostScreen, {
      // Paddings to handle safe area
      paddingTop: insets.top ? insets.top : 10,
      paddingBottom: insets.bottom ? insets.bottom : 10,
      paddingLeft: insets.left ? insets.left : 10,
      paddingRight: insets.right ? insets.right : 10,
    }]}>
        <LinearGradient colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.1)', 'transparent']} locations={[0,.8,1]} style={[styles.questionOfTheDayCard]}>
          {/* <Text style={styles.logo}>P.</Text> */}
          <Text numberOfLines={3} style={styles.questionOfTheDay}>{questionOfTheDay}</Text>
        </LinearGradient>
        {!isRecording && !showIntro ?
        <LinearGradient colors={['transparent', 'rgba(0,0,0,.3)', 'rgba(0,0,0,0.5)']} locations={[0,.3,1]} style={[styles.timerContainer]}>
          <CountdownTimer
            duration={testing ? 2 : 10}
            colors={'white'}
            isPlaying
            onComplete={() => {recordVideo()}}  
          />
         </LinearGradient>
          : undefined }
            {/* <Button title={"Toggle Camera"} onPress={toggleCameraType} /> */}
            {/* <Button title={isRecording ? "Stop Recording" : "Record Video"} onPress={isRecording ? stopRecording : recordVideo} /> */}
            {isRecording ? 
            <LinearGradient colors={['transparent', 'rgba(0,0,0,.3)', 'rgba(0,0,0,0.5)']} locations={[0,.3,1]} style={[styles.timerContainer]}>
            
              <View style={styles.recGroup}>
                { showRecordingIcon ? 
                <FontAwesomeIcon
                  icon={['fas', 'circle']}
                  size={20}
                  color={'#E53E3E'}
                /> : <View style={{height: 20, width: 20}}></View>
                }
                <Text style={styles.recText}>
                  REC
                </Text>
              </View>
              <CountdownTimer
                duration={testing ? 5 : 20}
                colors={'white'}
                isPlaying
                onComplete={() => {stopRecording()}}
                onUpdate={() => {showRecordingIcon ? setShowRecordingIcon(false) : setShowRecordingIcon(true)}}
              />
            </LinearGradient>
            : undefined
            } 

    </Camera>
  );
}
