// FILE: src/Register.js (FULL CORRECTED CODE - Back-end Functionality Added, Layout Respected)

import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Register.css'; 
import MedIcon from './assets/patient-data.png';

// 🎯 NEW: Define the base URL from the environment variable
// The base URL is now 'https://medical-dialysis-app-server.vercel.app'
const API_BASE_URL = process.env.REACT_APP_API_URL; 

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        // 🎯 FIX 1: Add first_name and last_name to state to match backend schema
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    // 🎯 FIX 2: Destructure all fields
    const { first_name, last_name, email, password, confirmPassword } = formData;

    // Renaming to match schema for consistency
    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

        const onSubmit = async e => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match.', {
                position: "top-center"
            });
            return;
        }

        try {
            // ✅ CRITICAL FIX 2: Construct the full URL using the defined API_BASE_URL 
            // This ensures the call goes to: https://medical-dialysis-app-server.vercel.app/auth/register
            const REGISTER_URL = `${API_BASE_URL}/auth/register`;

            // 🎯 Ensure all required fields are sent
            const res = await axios.post(REGISTER_URL, { 
                first_name, 
                last_name, 
                email, 
                password 
            });

            // (Your existing success logic)
            toast.success('Registration successful! Please login.', {
                position: "top-center",
                autoClose: 2000
            });
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            // (Your existing error logic)
            toast.error(err.response?.data?.msg || 'Registration failed. Please try again.', {
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
            className="register-container-wrapper" 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <ToastContainer />
            <motion.div className="register-container">
                <motion.div
                    className="register-icon-placeholder"
                    variants={itemVariants}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                    <img src={MedIcon} alt="Medical Icon" className="login-icon" />
                </motion.div>

                <motion.p
                    className="register-subtitle"
                    variants={itemVariants}
                >
                    Create a new account for patient records.
                </motion.p>

                <motion.form
                    className="register-form"
                    onSubmit={onSubmit}
                    variants={itemVariants}
                >
                    {/* 🎯 FIX 4: ADDED FIRST NAME FIELD (Using existing layout CSS) */}
                    <motion.div
                        className="form-group"
                        variants={itemVariants}
                    >
                        <label htmlFor="first_name">First Name</label>
                        <input
                            type="text"
                            placeholder="Enter first name"
                            name="first_name" // Must match state and backend key
                            value={first_name}
                            onChange={onChange}
                            required
                        />
                    </motion.div>

                    {/* 🎯 FIX 5: ADDED LAST NAME FIELD (Using existing layout CSS) */}
                    <motion.div
                        className="form-group"
                        variants={itemVariants}
                    >
                        <label htmlFor="last_name">Last Name</label>
                        <input
                            type="text"
                            placeholder="Enter last name"
                            name="last_name" // Must match state and backend key
                            value={last_name}
                            onChange={onChange}
                            required
                        />
                    </motion.div>
                    
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
                    <motion.div
                        className="form-group"
                        variants={itemVariants}
                    >
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            placeholder="Confirm password"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={onChange}
                            required
                        />
                    </motion.div>

                    <motion.button
                        type="submit"
                        className="register-btn"
                        variants={itemVariants}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Register
                    </motion.button>
                </motion.form>

                <motion.div className="login-link" variants={itemVariants}>
                    Already have an account? <Link to="/login">Login here</Link>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default Register;