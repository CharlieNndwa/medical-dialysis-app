// FILE: src/Login.js (NO FUNCTIONAL CHANGES NEEDED)

import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css';
import MedIcon from './assets/patient.png';

// 🎯 NEW: Define the base URL from the environment variable
// The base URL is now 'https://medical-dialysis-app-server.vercel.app'
const API_BASE_URL = process.env.REACT_APP_API_URL; 

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const { email, password } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
        // ✅ FIX: Use the full Vercel URL base and append only the server-side route
      const LOGIN_URL = `${API_BASE_URL}/auth/login`;
      const res = await axios.post(LOGIN_URL, formData); 

      // Store the token in local storage
      localStorage.setItem('token', res.data.token);

      // Call the login function from AuthContext and pass the token to it
      login(res.data.token);
      
      toast.success("Logged in successfully! Redirecting...", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      // Redirect to the dashboard/home page after a short delay
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (err) {
      // Display the specific error message from the backend if available
      toast.error(err.response?.data?.msg || "Login failed. Invalid Credentials or Server Error.", {
        position: "top-center"
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            staggerChildren: 0.1
        }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
        className="login-page-container" 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
    >
      <ToastContainer />
      <motion.div className="login-card">
        <motion.div
          className="login-icon-placeholder"
          variants={itemVariants}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <img src={MedIcon} alt="Medical Icon" className="login-icon" />
        </motion.div>

        <motion.h2
          className="login-title"
          variants={itemVariants}
        >
          Welcome Back
        </motion.h2>

        <motion.p
          className="login-subtitle"
          variants={itemVariants}
        >
          Sign in to access the Patient Records Management System.
        </motion.p>

        <motion.form
          className="login-form"
          onSubmit={onSubmit}
          variants={itemVariants}
        >
          <motion.div
            className="form-group"
            variants={itemVariants}
          >
            <label htmlFor="email">Email</label>
            <input
              type="email"
              placeholder="johndoe@netcare.com"
              name="email"
              value={email}
              onChange={onChange}
              required
            />
          </motion.div>
          <motion.div
            className="form-group"
            variants={itemVariants}
          >
            <label htmlFor="password">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              name="password"
              value={password}
              onChange={onChange}
              required
            />
          </motion.div>
          
          <motion.button
            type="submit"
            className="login-btn"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Log In
          </motion.button>
        </motion.form>
        
        <motion.div className="register-link" variants={itemVariants}>
          Don't have an account? <Link to="/register">Register here</Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Login;