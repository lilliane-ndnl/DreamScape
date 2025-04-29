// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Check for required environment variables
const requiredEnvVars = [
    'REACT_APP_FIREBASE_API_KEY',
    'REACT_APP_FIREBASE_AUTH_DOMAIN',
    'REACT_APP_FIREBASE_PROJECT_ID',
    'REACT_APP_FIREBASE_STORAGE_BUCKET',
    'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
    'REACT_APP_FIREBASE_APP_ID'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
let app;
try {
    app = initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully");
} catch (error) {
    console.error("Error initializing Firebase:", error);
    throw error;
}

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
        // Don't throw here as this is not critical for app functionality
    });

// Enable offline persistence for Firestore
enableIndexedDbPersistence(db)
    .then(() => {
        console.log("Firestore offline persistence enabled");
    })
    .catch((error) => {
        if (error.code === 'failed-precondition') {
            console.warn('Firestore persistence could not be enabled: Multiple tabs open');
        } else if (error.code === 'unimplemented') {
            console.warn('Firestore persistence not available in this browser');
        } else {
            console.error("Error enabling Firestore offline persistence:", error);
        }
        // Don't throw here as this is not critical for app functionality
    });

// Add a flag for debugging
window.firebaseInitialized = true;

// Export initialized services
export { auth, db, storage };
export default app;