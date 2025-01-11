import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCCY7pTqjDLjUioivpaYiu9b79N74SNB6g",
    authDomain: "wedding-album-76677.firebaseapp.com",
    projectId: "wedding-album-76677",
    storageBucket: "wedding-album-76677.firebasestorage.app",
    messagingSenderId: "487675296177",
    appId: "1:487675296177:web:1ed5dbd56bfa9b6d60a590"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);

export { storage, db };