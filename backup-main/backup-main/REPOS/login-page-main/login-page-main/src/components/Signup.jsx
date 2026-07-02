import React, { useState } from "react";
import "./css/signup.css";
import { auth } from "../firebaseconfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const closethis = () => {
    window.location.href = "/";
  };

  const shandlesubmit = async (e) => {
    e.preventDefault();

    if (!name) {
      setErrors({ name: "Name is required" });
      return;
    }else if (!email) {
      setErrors({ email: "Email is required" });
      return;
    }else if (!password) {
      setErrors({ password: "Password is required" });
      return;
    }else if (password.length < 8) {
      setErrors({ password: "Password must be at least 8 characters long" });
      return;
    }else if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name }); // Save the user's name
      console.log("User created successfully!");
      document.getElementById("logedornot").innerHTML = "User created successfully!";
      navigate("/home");
    } catch (error) {
      console.error("Error creating user:", error.message);
      alert("Failed to create user");
    }
  };

  return (
    <div id="signupbody">
      <div id="logedornot">
        <p></p>
      </div>
      <div id="signupcontent">
        <form onSubmit={shandlesubmit}>
          <div id="shrinked">
            <button onClick={closethis} id="sclosebut">
              X
            </button>
            <section id="logo">
              <h1>SIGN UP</h1>
            </section>
            <div id="overlogin">
              <section id="loginpart">
                <input type="text" className="inp" id="username" placeholder="User Name" onChange={(e) => setName(e.target.value)} />
                {errors.name && <p className="serror">{errors.name}</p>}

                <input type="email" className="inp" id="email" placeholder="Your Email" onChange={(e) => setEmail(e.target.value)} />
                {errors.email && <p className="serror">{errors.email}</p>}

                <input type="password" className="inp" id="password" placeholder="Your Password" onChange={(e) => setPassword(e.target.value)} />
                {errors.password && <p className="serror">{errors.password}</p>}

                <input type="password" className="inp" id="confirmPassword" placeholder="Re-enter Your Password" onChange={(e) => setConfirmPassword(e.target.value)} />
                {errors.confirmPassword && <p className="serror">{errors.confirmPassword}</p>}
              </section>

              <p id="loginp">
                Already have an account? <a href="/">Login</a>
              </p>

              <section id="buttons">
                <button type="submit">Submit</button>
              </section>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
