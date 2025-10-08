// FILE: routes/patientRoutes.js (FINAL CORRECTED CODE)

const express = require('express');
const router = express.Router();
const db = require('../config/db'); // db is the pool, we use db.query()
const { addPathologyRecord } = require('../controllers/patientController');
const authenticateToken = require('../middleware/authMiddleware');

// --------------------------------------------------------
// PATIENT MASTER RECORD ROUTES
// --------------------------------------------------------

// POST /api/patients (Create a new patient master record)
router.post('/', authenticateToken, async (req, res) => { 
    const userId = req.user.id; 

    // Destructure keys to match front-end data keys (using camelCase for FE variables)
    const {
        fullName, age, gender, address, contactDetails, nextOfKin, height, weight,
        accessType, diabeticStatus, smokingStatus, 
        dialysisModality, // FIX 1: Renamed from 'modality' for FE/BE consistency
        frequency, 
        dialyser, // FIX 2: Corrected to UK spelling to match schema (dialyzer was used before)
        buffer, anticoagulant, 
        prescribedDose, // Maps to DB's script_duration
        scriptExpiryDate, // Maps to DB's script_validity_end
        scriptReminder, dateOfBirth
    } = req.body; 

    try {
        const diabeticBool = diabeticStatus === 'Y'; 
        const smokingBool = smokingStatus === 'Y'; 

        const query = `
            INSERT INTO patient_master_records (
                user_id, full_name, gender, address, contact_details, next_of_kin, 
                height, weight, access_type, diabetic_status, smoking_status, 
                dialysis_modality, -- FIX 3: Corrected DB column name
                frequency, 
                dialyser, -- FIX 4: Corrected DB column name to 'dialyser' (UK spelling)
                buffer, anticoagulant, 
                script_duration, -- FIX 5: Corrected DB column name for prescribedDose
                script_validity_end, -- FIX 6: Corrected DB column name for scriptExpiryDate
                script_reminder, 
                date_of_birth
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
            RETURNING patient_id;
        `;

        // The values array must contain 20 items for $1 to $20
        const values = [
            userId, fullName, gender, address, contactDetails, nextOfKin, 
            height, weight, accessType, diabeticBool, smokingBool, 
            dialysisModality, // Value for $12
            frequency, // Value for $13
            dialyser, // Value for $14
            buffer, anticoagulant, // Values for $15, $16
            prescribedDose, // Value for $17 (script_duration)
            scriptExpiryDate, // Value for $18 (script_validity_end)
            scriptReminder, dateOfBirth // Values for $19, $20
        ];

        const result = await db.query(query, values); 
        
        // 🎯 FIX: Ensure the successful response structure is simple and correct
        // The patient_id is in result.rows[0].patient_id
        res.status(201).json({ 
            message: 'Patient record created successfully!', 
            patientId: result.rows[0].patient_id // This returns the correct ID
        });

    } catch (err) {
        console.error('Database POST /api/patients Error:', err);
        res.status(500).json({ error: 'Failed to save patient record.', details: err.message });
    }
});


// GET /api/patients (Fetch all patient master records for the list view) (SECURED)
// Route: GET /api/patients
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const query = `
            SELECT 
                patient_id AS id, 
                full_name, 
                EXTRACT(YEAR FROM age(NOW(), date_of_birth)) AS age, 
                gender, 
                dialysis_modality, -- FIX 7: Corrected DB column name
                access_type, 
                contact_details,
                TO_CHAR(date_of_birth, 'YYYY-MM-DD') AS date_of_birth 
            FROM patient_master_records 
            WHERE user_id = $1 
            ORDER BY full_name ASC;
        `;

    const result = await db.query(query, [userId]);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Database GET /api/patients Error:', err);
    res.status(500).json({ error: 'Failed to fetch patient records.', details: err.message });
  }
});


// --------------------------------------------------------
// PATIENT PATHOLOGY ROUTES (No change needed unless filtering is required)
// --------------------------------------------------------

// POST /api/patients/:patientId/pathology (Add a pathology record)
router.post('/:patientId/pathology', authenticateToken, addPathologyRecord);


module.exports = router;