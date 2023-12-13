// Import the functions you need from the SDKs you need
import { getAuth } from "firebase/auth";
import { getFirestore } from "@firebase/firestore";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAcWH6qbJuJJH6-YXXdZ4TSF5d5MBCcXus",
  authDomain: "otaku-wavee.firebaseapp.com",
  projectId: "otaku-wavee",
  storageBucket: "otaku-wavee.appspot.com",
  messagingSenderId: "438964260986",
  appId: "1:438964260986:web:1936e79c188eb83391abc3",
  measurementId: "G-2ZF82CEJLH",
  storageBucket: "gs://otaku-wavee.appspot.com",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth();
const storage = getStorage(app);

const db = getFirestore(app);

export { app, auth, db, storage };
