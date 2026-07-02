// Import necessary Firebase modules
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";

// Securely load environment variables

const firebaseConfig = {
  apiKey: "AIzaSyAF0srJ9eRqC9-1Zyf7ZiRrDi9Fw6WMUzQ",
  authDomain: "todo-list-2c4e2.firebaseapp.com",
  projectId: "todo-list-2c4e2",
  storageBucket: "todo-list-2c4e2.firebasestorage.app",
  messagingSenderId: "111341714282",
  appId: "1:111341714282:web:2befc286768ae41c0a4313",
  measurementId: "G-CEDFRW89B1",
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Social authentication providers
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const githubProvider = new GithubAuthProvider();


export default app;



















// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import {
//   GoogleAuthProvider,
//   FacebookAuthProvider,
//   GithubAuthProvider,
// } from "firebase/auth";
// // TODO: Add SDKs for Firebase products that you want to use

// const firebaseConfig = {
//   apiKey: "AIzaSyAF0srJ9eRqC9-1Zyf7ZiRrDi9Fw6WMUzQ",
//   authDomain: "todo-list-2c4e2.firebaseapp.com",
//   projectId: "todo-list-2c4e2",
//   storageBucket: "todo-list-2c4e2.firebasestorage.app",
//   messagingSenderId: "111341714282",
//   appId: "1:111341714282:web:2befc286768ae41c0a4313",
//   measurementId: "G-CEDFRW89B1",
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);
// export const googleProvider = new GoogleAuthProvider();
// export const facebookProvider = new FacebookAuthProvider();
// export const githubProvider = new GithubAuthProvider();
// export default app;
