import React, { useState } from "react";
import "./css/login.css";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import {
  auth,
  githubProvider,
  googleProvider,
  facebookProvider,
} from "../firebaseconfig";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("User login successfully!");
      navigate("/home");
    } catch (error) {
      console.error("Error creating user with email and password:", error);
      alert("Failed to login user");
    }
    var validerror = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      validerror.email = "invalid email address";
      // setErrors( "Invalid email address");
    }
    if (password.length < 6) {
      validerror.password = "password must contains 6 charecters";
    }
    setErrors(validerror);
    console.log(email);
    console.log(password);
  };
  const handleothersigns = (e) =>{
    e.preventDefault();
    navigate("/signin");
  }
  return (
    <div id="login-body">
      <div id="formback">
        <form>
          <section id="sectone" className="sect">
            <h1> LOGIN </h1>
          </section>
          <section id="secttwo" className="sect">
            <div id="sect2input1" className="inputsdiv">
              <input
                type="email"
                className="inputs"
                placeholder="Enter your Email"
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <p className="errors">{errors.email}</p>}
            </div>
          </section>
          <section id="sectthree" className="sect">
            <div id="sect3input1" className="inputsdiv">
              <input
                type="password"
                className="inputs"
                placeholder="Enter your Password"
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && <p className="errors">{errors.password}</p>}
            </div>
          </section>
          <section id="createuser">
            not a user! <a href="/signup">signup</a>
          </section>
          <section id="sectfour" className="sect">
            <div>
              <button
                className="submitbut"
                type="submit"
                onClick={handleSubmit}
              >
                submit
              </button>
            </div>{" "}
            or..
            <button onClick={handleothersigns} id="othersi">sign in with other platforms</button>
          </section>
        </form>
      </div>
    </div>
  );
};
export default Login;
