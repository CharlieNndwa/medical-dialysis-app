// FILE: middleware/authMiddleware.js (FIXED FOR 'jwt malformed' ERROR)

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // 1. Extract the token from 'x-auth-token' or 'Authorization: Bearer <token>'
    const authHeader = req.headers['authorization'];
    
    // Check for 'x-auth-token' header first
    let token = req.header('x-auth-token'); 
    
    // If not found, check the 'Authorization: Bearer <token>' header
    if (!token && authHeader) {
        const parts = authHeader.split(' ');
        // Ensure it has two parts (Bearer and Token)
        if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
            token = parts[1];
        }
    }
    
    // 🎯 CRITICAL FIX: Explicitly check for falsy values AND the string 'null'
    if (!token || token.toLowerCase() === 'null' || token.toLowerCase() === 'undefined') {
        // This ensures that if the frontend sends "Bearer null", we fail gracefully
        return res.status(401).json({ msg: 'Access denied. No valid token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Attach the decoded user payload to the request object
        req.user = decoded.user; 
        next();
    } catch (err) {
        console.error('Token verification error:', err.message);
        // The error will be 'jwt malformed' if the token is garbage, 
        // but now it won't be caused by the string "null".
        return res.status(401).json({ msg: 'Token is not valid or expired' });
    }
};