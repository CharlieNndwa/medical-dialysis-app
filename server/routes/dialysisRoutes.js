// FILE: routes/dialysisRoutes.js

const express = require('express');
const router = express.Router();
// Assuming a database connection 'db' is available
const db = require('../config/db'); 

// Helper function to convert camelCase to snake_case for PostgreSQL columns
const toSnakeCase = (str) => {
    // Prevent common keys (like time_intervals, postKtv) from being over-converted
    if (['time_intervals', 'postKtv', 'postQd', 'postQb'].includes(str)) return str.toLowerCase();
    
    // Convert regular camelCase
    return str.replace(/([A-Z])/g, (match) => `_${match.toLowerCase()}`);
};

/**
 * @route POST /api/dialysis/chart
 * @description Create a new hemodialysis record and save it to the database
 * @access Private (Add your authentication middleware here)
 */
router.post('/chart', async (req, res) => {
    // Placeholder IDs - Replace with actual values from session/auth middleware later
    const { 
        patient_id = 1, 
        recorded_by_user_id = 1, 
        ...formData 
    } = req.body;

    // Filter out fields that are null or empty string, or undefined
    const validKeys = Object.keys(formData).filter(key => 
        formData[key] !== null && formData[key] !== '' && formData[key] !== undefined
    );

    // Prepare column names for the query
    let columns = ['patient_id', 'recorded_by_user_id'];
    columns.push(...validKeys.map(toSnakeCase));
    
    // Prepare values array and placeholders for parameterized query
    let values = [patient_id, recorded_by_user_id];
    let placeholders = ['$1', '$2'];

    validKeys.forEach((key, index) => {
        const value = formData[key];
        
        // Handle the nested JSON array for time intervals
        if (key === 'time_intervals') {
            // PostgreSQL often stores JSON arrays as a stringified JSONB type
            values.push(JSON.stringify(value));
        } else {
            values.push(value);
        }
        placeholders.push(`$${index + 3}`);
    });

    const query = `
        INSERT INTO hemodialysis_records (${columns.join(', ')})
        VALUES (${placeholders.join(', ')})
        RETURNING *;
    `;

    try {
        const result = await db.query(query, values);
        
        // Return the saved record for the frontend summary table
        res.status(201).json({ 
            message: "Hemodialysis Chart Saved Successfully!", 
            record: result.rows[0] 
        });
    } catch (err) {
        console.error('Database INSERT Error for Hemodialysis Chart:', err.stack);
        res.status(500).json({ 
            message: 'Failed to save hemodialysis chart due to a server error.', 
            details: err.message 
        });
    }
});

module.exports = router;