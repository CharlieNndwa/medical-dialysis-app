// FILE: server/controllers/hemodialysisController.js

// 🎯 FINAL FIX: Import the database pool object directly, as it is the only thing exported by db.js
const pool = require('../config/db');
const authenticateToken = require('../middleware/authMiddleware'); // Assuming this is used

// --- UTILITY ---
// Utility function to format a date to 'YYYY-MM-DD'
const formatDate = (date) => {
    if (!date) return null;
    // Ensure date is a valid object before calling toISOString
    const d = new Date(date);
    return isNaN(d) ? null : d.toISOString().split('T')[0];
};


const saveHemodialysisRecord = async (req, res) => {
    const { patientId } = req.params;
    const userId = req.user.id; 

    if (!patientId || !userId) {
        return res.status(400).json({ message: "Missing Patient ID or User Authentication." });
    }

    const {
        dialysisDate,
        preWeight,
        postWeight,
        durationHours,
        dialyzerType,
        bloodFlowRate,
        dialysateFlowRate,
        staffInitials,
        notes,
        // 🎯 FIX: Ensure these are correctly destructured from the request body
        diagnosis, 
        timeOn,    
        timeOff,   
    } = req.body; 

    try {
        const query = `
            INSERT INTO hemodialysis_records (
                patient_id, session_date, pre_weight, post_weight, 
                duration_hours, dialyzer_type, blood_flow_rate, 
                dialysate_flow_rate, staff_initials, notes, 
                diagnosis, time_on, time_off /* 🎯 CRITICAL: Only 13 columns now */
            )
            VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                $11, $12, $13 /* 🎯 CRITICAL: Only 13 placeholders now */
            )
            RETURNING *;
        `;
        
        const values = [
            patientId,
            formatDate(dialysisDate), 
            preWeight,
            postWeight,
            durationHours,
            dialyzerType,
            bloodFlowRate,
            dialysateFlowRate,
            staffInitials,
            notes,
            // 🎯 FIX: Add the new values in the correct order
            diagnosis, 
            timeOn,    
            timeOff,   
        ];

        // Ensure notes is not undefined (PostgreSQL can handle null/empty string, but safer to check)
        // You might need a more comprehensive check here if any field is required
        
        const result = await pool.query(query, values);

        res.status(201).json({ 
            message: "Hemodialysis record saved successfully!", 
            record: result.rows[0] 
        });
    } catch (err) {
        // This is the CRITICAL line: If it freezes again, check your console for this stack trace!
        console.error("Error saving hemodialysis record (SQL query failed):", err.stack); 
        res.status(500).json({
            message: "Failed to save hemodialysis record due to server error.",
            error: err.message
        });
    }
};

// ----------------------------------------------------
// 2. GET: ALL HEMODIALYSIS RECORDS FOR A PATIENT (FIXED: Removed N/A placeholders)
// ----------------------------------------------------
const getHemodialysisRecords = async (req, res) => {
    const { patientId } = req.params;
    const userId = req.user.id; 

    // 🎯 CRITICAL FIX: Select the diagnosis, time_on, and time_off fields
    const query = `
        SELECT 
            hr.id AS record_id, 
            pmr.patient_id,
            pmr.full_name,
            hr.diagnosis,    /* 🎯 CRITICAL FIX: Added */ 
            hr.time_on,      /* 🎯 CRITICAL FIX: Added */ 
            hr.time_off,     /* 🎯 CRITICAL FIX: Added */ 
            hr.session_date, 
            hr.pre_weight, 
            hr.post_weight, 
            hr.staff_initials
        FROM 
            hemodialysis_records hr
        INNER JOIN 
            patient_master_records pmr ON hr.patient_id = pmr.patient_id
        WHERE 
            hr.patient_id = $1 AND pmr.user_id = $2
        ORDER BY 
            hr.session_date DESC, hr.id DESC; 
    `;

    try {
        const result = await pool.query(query, [patientId, userId]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Error fetching hemodialysis records:", err.message);
        res.status(500).json({
            message: "Failed to fetch hemodialysis records.",
            error: err.message
        });
    }
};

// FILE: server/controllers/hemodialysisController.js

// ----------------------------------------------------
// 3. GET SINGLE PATIENT MASTER RECORD FOR AUTOFILL (SEARCH BUTTON)
// ----------------------------------------------------
const getPatientDetailsForChart = async (req, res) => {
    // patientId is extracted from the route: /api/hemodialysis/patient/:patientId
    const { patientId } = req.params;
    const userId = req.user.id; // Extracted from the authenticated token

     try {
        const query = `
            SELECT 
                pmr.patient_id, 
                pmr.full_name AS name,
                pmr.age,                     
                pmr.address,                 
                pmr.contact_details,          
                pmr.gender,
                
                -- CRITICAL FIX: Change column name from 'dialyzer' to 'dialyser' (or 'dialysis_dialyzer', check schema)
                pmr.height,                   
                pmr.dialyser AS dialyzer,     
                pmr.access_type,
                pmr.diagnosis                 
            FROM 
                patient_master_records pmr
            WHERE 
                pmr.patient_id = $1 AND pmr.user_id = $2;
        `;

        // Use 'pool' directly
        const result = await pool.query(query, [patientId, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Patient not found or unauthorized access." });
        }

        const patient = result.rows[0];

        res.status(200).json(patient);
    } catch (err) {
        console.error("Error fetching patient details for chart:", err.stack);
        res.status(500).json({
            message: "Failed to fetch patient details.",
            error: err.message
        });
    }
};


module.exports = {
    saveHemodialysisRecord,
    getHemodialysisRecords,
    getPatientDetailsForChart
};