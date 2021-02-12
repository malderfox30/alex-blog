import firebase from "firebase/app";
import database from "firebase/database";

const config = {
    apiKey: "AIzaSyBVv98fLq4tDeg5RgwgdIn1-xo9jNF0meQ",
    authDomain: "alex-blog-react.firebaseapp.com",
    projectId: "alex-blog-react",
    storageBucket: "alex-blog-react.appspot.com",
    messagingSenderId: "403179241341",
    appId: "1:403179241341:web:b15d680317a07982d2d614",
    measurementId: "G-2BBH24YDK2"
};

let firebaseCache;

export const getFirebase = () => {
  if (firebaseCache) {
    return firebaseCache;
  }

  firebase.initializeApp(config);
  firebaseCache = firebase;
  return firebase;
};