import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCuQxiBc8yc0zqkzTTG5ZV52PbIF5TDeKA",
  authDomain: "app-server-eb64d.firebaseapp.com",
  databaseURL: "https://app-server-eb64d-default-rtdb.firebaseio.com",
  projectId: "app-server-eb64d",
  storageBucket: "app-server-eb64d.appspot.com",
  messagingSenderId: "311789081160",
  appId: "1:311789081160:web:a615f64b226342f8c77e7d",
  measurementId: "G-941MTLETPW"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

githubProvider.addScope('repo');
githubProvider.addScope('read:user');
githubProvider.addScope('user:email');

export { app, auth, db, googleProvider, githubProvider };

