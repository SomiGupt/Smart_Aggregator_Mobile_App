// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyALfp2p2J1lOHYqxlb9HfkAdihn0G28UNQ",
  authDomain: "smart-aggregator-app-fc99d.firebaseapp.com",
  projectId: "smart-aggregator-app-fc99d",
  storageBucket: "smart-aggregator-app-fc99d.appspot.com",
  messagingSenderId: "677598345756",
  appId: "1:677598345756:web:7ab95c1d389498f3d7bdd9"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIRESTORE_DB = getFirestore(FIREBASE_APP);
export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
    persistence: getReactNativePersistence(AsyncStorage)
});