import React from "react";
import "./css/othersign.css";
import googlepic from "./images/google.png";
import facebookepic from "./images/facebook.png";
import githubpic from "./images/github.png";
import { signInWithPopup } from "firebase/auth";
import {
  auth,
  githubProvider,
  googleProvider,
  facebookProvider,
} from "../firebaseconfig"; 
import { useNavigate } from "react-router-dom";

const Othersignin = () => { 
  const navigate = useNavigate();

  const handleGooglesubmit = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      console.log("User signed in with Google");
      navigate("/home");
    } catch (error) {
      console.error("Error signing in with Google:", error.message);
    }
  };

  const handleFacebooksubmit = async () => {
    try {
      await signInWithPopup(auth, facebookProvider);
      console.log("User signed in with Facebook");
      navigate("/home");
    } catch (error) {
      console.error("Error signing in with Facebook:", error.message);
    }
  };

  const handleGithubsubmit = async () => {
    try {
      await signInWithPopup(auth, githubProvider);
      console.log("User signed in with GitHub");
      navigate("/home");
    } catch (error) {
      console.error("Error signing in with GitHub:", error.message);
    }
  };
  const closethis = () => {
    window.location.href = "/"; // Redirect to home page when close button is clicked
  };
  return (
    <div id="othersigninbody">
      <div id="othersignindiv">
        <button onClick={closethis} id="closebut">X</button>
        <div id="descript">
          <h2>Other Sign In Methods</h2>
          <p>Sign in with your social media accounts:</p>
        </div>
        <div id="buttons">
          <button onClick={handleGooglesubmit}>
            <img src={googlepic} className="googleimg" alt="Google" /> 
            Google
          </button>
          <button onClick={handleFacebooksubmit}>
            <img src={facebookepic} className="googleimg" alt="Facebook" />
            Facebook
          </button>
          <button onClick={handleGithubsubmit}>
            <img src={githubpic} className="googleimg" alt="GitHub" />
            GitHub
          </button>
        </div>
      </div>
    </div>
  );
};

export default Othersignin;
