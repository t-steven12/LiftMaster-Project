// Code in this file based on the following tutorials by Simon Grimm:
// 1. https://www.youtube.com/watch?v=ONAVmsGW6-M&t=1172s
// 2. https://www.youtube.com/watch?v=TwxdOFcEah4&t=1225s

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Firebase configurations can be exposed publicly without security risks. Use Firebase Security Rules to secure resources.
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB7xrcnIEHTde3fbFkw-7Qq-f9DdZUAcAU",
  authDomain: "reactnativeexample-73e58.firebaseapp.com",
  projectId: "reactnativeexample-73e58",
  storageBucket: "reactnativeexample-73e58.appspot.com",
  messagingSenderId: "208374490099",
  appId: "1:208374490099:web:c1c341e3d6b40f83876886"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP)
export const FIRESTORE_DB = getFirestore(FIREBASE_APP)