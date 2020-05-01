// Your web app's Firebase configuration
console.log('hello')
import firebase from 'firebase'
var firebaseConfig = {
  apiKey: "AIzaSyBKLSdWP-FsIX85phMrResxlvIqVadj-Bs",
  authDomain: "shengji-online.firebaseapp.com",
  databaseURL: "https://shengji-online.firebaseio.com",
  projectId: "shengji-online",
  storageBucket: "shengji-online.appspot.com",
  messagingSenderId: "210420583186",
  appId: "1:210420583186:web:3adfccdbc48b53514501cb",
  measurementId: "G-CN5J8B906Q"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
export default firebase;