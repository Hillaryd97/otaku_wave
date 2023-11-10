// Import the functions you need from the SDKs you need
import { getAuth } from "firebase/auth";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBA0ipFCXNIQkVIOz2XKTUYJs0Yfa2b7CU",
  authDomain: "otaku-wave.firebaseapp.com",
  projectId: "otaku-wave",
  storageBucket: "otaku-wave.appspot.com",
  messagingSenderId: "375810838595",
  appId: "1:375810838595:web:57ce745b23a26f130184f6",
  measurementId: "G-29Z46EGB9F",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth();

export { app, auth };
