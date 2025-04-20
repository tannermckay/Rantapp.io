// Handle incoming messages. Called when:
// - a message is received while the app has focus
// - the user clicks on an app notification created by a service worker
//   `messaging.onBackgroundMessage` handler.
// import { onMessage } from "firebase/messaging";
// import { msg } from "./firebaseConfig";

// onMessage(msg, (payload) => {
//   console.log('Message received. ', payload);
//   // ...
// });