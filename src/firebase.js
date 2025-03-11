// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Set persistence to LOCAL by default
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Firebase auth persistence set to LOCAL");
  })
  .catch((error) => {
    console.error("Error setting auth persistence:", error);
  });

// Enable offline data persistence for Firestore
// This helps with network issues and performance on Netlify
try {
  enableIndexedDbPersistence(db)
    .then(() => {
      console.log("Firestore persistence enabled");
    })
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Firestore persistence could not be enabled: Multiple tabs open');
      } else if (err.code === 'unimplemented') {
        console.warn('Firestore persistence not available in this browser');
      } else {
        console.error("Error enabling Firestore persistence:", err);
      }
    });
} catch (error) {
  console.error("Error with Firestore persistence setup:", error);
}

// Add a flag for debugging
window.firebaseInitialized = true;

// Export initialized services
export { auth, db, storage };
export default app;