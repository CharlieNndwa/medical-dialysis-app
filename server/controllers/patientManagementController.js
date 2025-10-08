// FILE: controllers/patientManagementController.js (FULL CORRECTED CODE)

const pool = require('../config/db'); // IMPORTANT: Adjust path to your DB connection file

// @route   POST /api/patient-management
// @desc    Create a new patient management/follow-up record
// @access  Private (Requires authentication via JWT)
exports.createPatientManagementRecord = async (req, res) => {
    // 🎯 Get the authenticated user ID from your JWT middleware
    const recordedByUserId = req.user.id; 
    
    const { 
        patientId, 
        lastFluVaccineDate, lastPneumoVaccineDate, otherVaccinationNotes,
        lastDieticianVisitDate, dieticianComplianceNotes,
        lastFistulaAssessmentDate, fistulaCondition, fistulaNotes,
        otherManagementSpecify
    } = req.body;

    // Simple validation
    if (!patientId || !recordedByUserId) {
        return res.status(400).json({ message: 'Patient ID and User ID are required.' });
    }

    const sqlQuery = `
        INSERT INTO patients_management_records (
            patient_id, recorded_by_user_id,
            last_flu_vaccine_date, last_pneumo_vaccine_date, other_vaccination_notes,
            last_dietician_visit_date, dietician_compliance_notes,
            last_fistula_assessment_date, fistula_condition, fistula_notes,
            other_management_specify, 
            recorded_at  -- 🎯 FIX: Added column name
        ) 
        VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 
            NOW() -- 🎯 FIX: Added value for recorded_at
        )
        RETURNING id;
    `;
    
    // Use null for empty date fields to avoid PostgreSQL errors
    const values = [
        patientId, recordedByUserId, 
        lastFluVaccineDate || null, lastPneumoVaccineDate || null, otherVaccinationNotes,
        lastDieticianVisitDate || null, dieticianComplianceNotes,
        lastFistulaAssessmentDate || null, fistulaCondition, fistulaNotes,
        otherManagementSpecify
        // Note: NOW() is passed directly in the query string, so there are 11 values here.
    ];

    try {
        const result = await pool.query(sqlQuery, values);

        res.status(201).json({ 
            message: 'Patient Management record saved successfully.', 
            recordId: result.rows[0].id 
        });

    } catch (err) {
        console.error('PostgreSQL Patient Management Save Error:', err.message);
        res.status(500).json({ 
            message: 'Failed to save patient management record.', 
            error: err.message 
        });
    }
};

// @route   GET /api/patient-management
// @desc    Fetch all patient management summary records
// @access  Private
exports.getPatientManagementRecords = async (req, res) => {
    try {
        // This query is now correct because recorded_at will exist
        const query = `
            SELECT 
                id,
                patient_id,
                TO_CHAR(last_flu_vaccine_date, 'YYYY-MM-DD') AS last_flu_vaccine_date,
                TO_CHAR(last_dietician_visit_date, 'YYYY-MM-DD') AS last_dietician_visit_date,
                TO_CHAR(last_fistula_assessment_date, 'YYYY-MM-DD') AS last_fistula_assessment_date,
                TO_CHAR(recorded_at, 'YYYY-MM-DD HH24:MI') AS recorded_at
            FROM patients_management_records
            ORDER BY recorded_at DESC;
        `;
        const result = await pool.query(query);

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('PostgreSQL Patient Management GET Error:', err.message);
        res.status(500).json({ 
            message: 'Failed to fetch patient management records. Check server console for SQL error.', 
            error: err.message 
        });
    }
};