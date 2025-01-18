import { getApps,initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// const firebaseConfig = {
//     apiKey: "AIzaSyBv6ac_JjYWrnIBKe4k_WJ2zI8eueUQj-k",
//     authDomain: "react-wedding-album.firebaseapp.com",
//     projectId: "react-wedding-album",
//     storageBucket: "react-wedding-album.firebasestorage.app",
//     messagingSenderId: "51536482323",
//     appId: "1:51536482323:web:010bec1fa523896e2c2fe6"
// };

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const storage = getStorage(app);
const db = getFirestore(app);

export { app,storage, db };