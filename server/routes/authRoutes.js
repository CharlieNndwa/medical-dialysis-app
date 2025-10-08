// FILE: routes/authRoutes.js (CORRECTED REGISTRATION LOGIC)

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// IMPORTANT: Replace with the actual path to your database config
const db = require('../config/db'); 

// Register a new user
router.post('/register', async (req, res) => {
    try {
        // 🎯 FIX: Destructure ALL required fields (first_name, last_name, email, password)
        const { first_name, last_name, email, password } = req.body; 
        console.log(`[AUTH] Register attempt for: ${email}`);
        
        // 1. Basic validation (optional, but good practice)
        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ msg: 'Please enter all required fields: First Name, Last Name, Email, and Password.' });
        }

        // 2. Check if user already exists
        const existingUser = await db.query("SELECT email FROM users WHERE email = $1", [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ msg: 'Email already exists' });
        }

        // 3. Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        
        // 4. Save user to database
        const newUser = await db.query(
            // 🎯 FIX: Include first_name and last_name in the INSERT query
            "INSERT INTO users (first_name, last_name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, email",
            [first_name, last_name, email, password_hash]
        );
        res.status(201).json({ msg: 'User registered successfully', user: newUser.rows[0] });
    } catch (err) {
        console.error(err.message);
        if (err.code === '23505') {
            return res.status(400).json({ msg: 'Email already exists' });
        }
        res.status(500).send('Server Error');
    }
});

// Login user
router.post('/login', async (req, res) => {
    // ... (Your existing login code remains here)
    try {
        const { email, password } = req.body;
        console.log(`[AUTH] Login attempt for: ${email}`);
        
        // Check if user exists
        const user = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        if (user.rows.length === 0) {
            console.log(`[AUTH] Login Failed: User ${email} not found.`);
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }
        // ... (rest of the login logic)
        const isMatch = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!isMatch) {
            console.log(`[AUTH] Login Failed: Password mismatch for ${email}.`);
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }
        // Create JWT payload
        const payload = {
            user: {
                id: user.rows[0].id,
                email: user.rows[0].email,
            }
        };

        // Sign and send token
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                console.log(`[AUTH] Login Success for: ${email}`);
                res.json({ token });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;