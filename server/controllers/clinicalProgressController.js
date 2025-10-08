// FILE: server/controllers/clinicalProgressController.js (UPDATED to exclude patientId)

const db = require('../config/db');

// --- 1. POST: Save Clinical Progress Log (UPDATED to exclude patientId) ---
const saveClinicalProgressLog = async (req, res) => {
    // 🎯 CRITICAL FIX: patientId is EXCLUDED per user request.
    const { logEntries } = req.body;
    // We rely on the JWT middleware for the user who is performing the logging
    const recorded_by_user_id = req.user.id; 

    if (!logEntries || !Array.isArray(logEntries) || logEntries.length === 0) {
        return res.status(400).json({ error: 'Valid log entries are required in the request body.' });
    }

    // Convert the log array into a JSON string/object for database storage
    const logEntriesJson = JSON.stringify(logEntries); 

    try {
        // ⚠️ WARNING: This query assumes your 'clinical_progress_logs' table 
        // does NOT have a 'patient_id' column or that the column allows NULL values.
        // If 'patient_id' is NOT NULL in your schema, this INSERT will FAIL.
        const query = `
            INSERT INTO clinical_progress_logs (
                recorded_by_user_id, 
                log_entries, 
                created_at
            ) VALUES ($1, $2, NOW())
            RETURNING *;
        `;
        
        const result = await db.pool.query(query, [recorded_by_user_id, logEntriesJson]);

        console.log(`Log entries saved by User ID: ${recorded_by_user_id}. (Patient ID intentionally excluded)`);
        res.status(201).json({ 
            message: 'Log entries saved successfully!',
            record: result.rows[0]
        });
    } catch (err) {
        console.error('Database POST /api/clinical-progress/log Error:', err.message);
        res.status(500).json({ error: 'Failed to save clinical progress logs.', details: err.message });
    }
};


// --- 2. GET: Fetch All Logs for a specific Patient ID (SECURED) ---
const getClinicalProgressLogs = async (req, res) => {
    const { patientId } = req.params; 
    // 🔑 FIX 1: Retrieve the authenticated user ID
    const userId = req.user.id; 
    
    if (!patientId) {
        return res.status(400).json({ error: 'Patient ID is required.' });
    }

    try {
        const query = `
            SELECT 
                cpl.*,
                pmr.user_id
            FROM clinical_progress_logs cpl 
            -- 🔑 FIX 2: JOIN with the patient table to check ownership
            JOIN patient_master_records pmr ON cpl.patient_id = pmr.patient_id
            WHERE 
                cpl.patient_id = $1 AND
                pmr.user_id = $2  -- 🚨 CRITICAL: Check that the patient belongs to the user
            ORDER BY created_at DESC;
        `;

        // 🔑 FIX 3: Pass both the patientId and the userId
        const result = await db.pool.query(query, [patientId, userId]);

        if (result.rows.length === 0) {
             // Return 404/Access Denied if no records are found or the patient isn't theirs
             return res.status(404).json({ msg: "Records not found or access denied." });
        }

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Database GET /api/clinical-progress/:patientId Error:', err.message);
        res.status(500).json({ error: 'Failed to fetch clinical progress logs.' });
    }
};



module.exports = {
    saveClinicalProgressLog,
    getClinicalProgressLogs,
};