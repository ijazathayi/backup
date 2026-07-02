import React from 'react'
import './css/homepage.css'
import { useEffect, useState } from'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebaseconfig'

const Homepage = () => {
  const navigate = useNavigate()
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Check if user is logged in
    const user = auth.currentUser;
    if (user) {
      setUserName(user.displayName || "User"); // Set the display name
    }
  }, []);

  const handlelogout = async () => {
    try {
      await signOut(auth)
      localStorage.removeItem('token')
      navigate('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }
  return (
    <div id='homepagebody' >
      <div>
        <h3>{userName}</h3>
        <p>Welcome to the homepage! <br /> This is where you can find all your favorite content.</p>
        <button onClick={handlelogout}>Log Out</button>
      </div>
    </div>
  )
}

export default Homepage
