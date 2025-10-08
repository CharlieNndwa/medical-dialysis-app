// FILE: controllers/patientController.js

// 🎯 Import the database client. Assumes it has a .pool.query method.
const db = require('../config/db'); 

/**
 * @route   POST /api/patients/:patientId/pathology
 * @desc    Add a new pathology record for a specific patient
 * @access  Private
 */
exports.addPathologyRecord = async (req, res) => {
    // 1. Extract data from URL and body
    const { patientId } = req.params;
    // Data expected from frontend payload (PathologyPage.js)
    const { testName, testType, testDate, testResult, resultUnit } = req.body; 

    // 2. Simple validation
    if (!testName || !testDate || !testResult || !patientId) {
        return res.status(400).json({ message: "Missing required pathology data (Name, Date, or Result). All fields are mandatory for initial save." });
    }

    try {
        // 3. Define the SQL INSERT query
        const sqlQuery = `
            INSERT INTO pathology_records (
                patient_id, 
                test_name, 
                test_type, 
                test_date, 
                result_value, 
                result_unit
            ) 
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *; -- Returns the newly inserted row
        `;
        
        // 4. Define the values array (Safe against SQL Injection)
        const values = [
            patientId,
            testName,
            testType,
            testDate, 
            testResult, // Maps to DB column 'result_value'
            resultUnit
        ];

        // 5. Execute the query
        // 🛠️ FIX: Use db.pool.query to correctly interact with the PostgreSQL connection pool
        const result = await db.pool.query(sqlQuery, values); 
        const newRecord = result.rows[0];

        // 6. Success response
        res.status(201).json({ 
            message: 'Pathology record saved successfully to PostgreSQL', 
            record: newRecord 
        });

    } catch (error) {
        // Catch foreign key violations, invalid dates, etc.
        console.error("PostgreSQL Error Saving Pathology Record:", error.message);
        // Provide specific error feedback in development, or a generic 500 in production
        res.status(500).json({ 
            message: 'Failed to save pathology record to the database.', 
            error: error.message 
        });
    }
};

// ... Add other controller functions (GET Pathology by Patient ID, etc.) here ...