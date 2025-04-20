import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getMessaging, getToken } from "firebase/messaging";

// Optionally import the services that you want to use
// import {...} from "firebase/auth";
// import {...} from "firebase/database";
// import {...} from "firebase/firestore";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAEaOCA4uLkD2VJaU97K9JfPjr6FkONxjs",
    authDomain: "prompt-social.firebaseapp.com",
    projectId: "prompt-social",
    storageBucket: "prompt-social.appspot.com",
    messagingSenderId: "39691051931",
    appId: "1:39691051931:web:0cd32137459eeabba2f73e",
    measurementId: "G-6T8DP7B79J"
  };

const app = initializeApp(firebaseConfig);

// initialize services we want to use throughout
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
// export const msg = getMessaging(app);

export default app;