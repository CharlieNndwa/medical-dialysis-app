// FILE: controllers/reportController.js (FINAL CORRECTED CODE)

const pool = require('../config/db'); // <-- Ensure this path is correct for your DB connection

// @route   POST /api/reports
// @desc    Create a new patient report record
// @access  Private (Requires authentication via JWT)
exports.createReport = async (req, res) => {
    // This assumes your JWT middleware attaches user info to req.user
    const recordedByUserId = req.user ? req.user.id : null; 
    
    const { 
        patientId, sessionsActual, sessionsPlanned, ktvPerPatient, weightAnalysisValue, 
        weightAnalysisType, urrTrend, treatmentPlanVsActual, consumablesPerPatient, 
        scheduling, ktvQuality, intraDialyticWeightGain, micturation, haemoglobin 
    } = req.body;

    if (!patientId || !sessionsActual || !sessionsPlanned) {
        return res.status(400).json({ message: 'Patient ID and session data are required.' });
    }

    // 🎯 NOTE: Ensure your table name is `patients_report_records` as per server.js,
    // or change it if you are using `patient_report_records`
    const sqlQuery = `
        INSERT INTO patients_report_records ( 
            patient_id, recorded_by_user_id, sessions_actual, sessions_planned, 
            ktv_per_patient, weight_analysis_value, weight_analysis_type, urr_trend, 
            treatment_plan_vs_actual, consumables_per_patient, scheduling, 
            ktv_quality, intra_dialytic_weight_gain, micturation, haemoglobin
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id;
    `;
    
    const values = [
        patientId, recordedByUserId, sessionsActual, sessionsPlanned, 
        ktvPerPatient, weightAnalysisValue, weightAnalysisType, urrTrend, 
        treatmentPlanVsActual, consumablesPerPatient, scheduling, 
        ktvQuality, intraDialyticWeightGain, micturation, haemoglobin
    ];

    try {
        const result = await pool.query(sqlQuery, values);
        res.status(201).json({ message: 'Report saved successfully.', reportId: result.rows[0].id });
    } catch (err) {
        console.error('PostgreSQL Report Save Error:', err.message);
        res.status(500).json({ message: 'Failed to save report.', error: err.message });
    }
};


// @route   GET /api/reports
// @desc    Fetch all patient report summary records
// @access  Private
exports.getReports = async (req, res) => {
    try {
        const query = `
            SELECT 
                r.id, 
                r.patient_id,
                r.sessions_actual,
                r.sessions_planned,
                r.ktv_per_patient,
                r.haemoglobin,
                TO_CHAR(r.recorded_at, 'YYYY-MM-DD HH24:MI') AS recorded_date,
                p.full_name 
            FROM patients_report_records r
            LEFT JOIN patient_master_records p ON r.patient_id = p.patient_id
            ORDER BY r.recorded_at DESC;
        `;
        const result = await pool.query(query);

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Database GET /api/reports Error:', err);
        res.status(500).json({ error: 'Failed to fetch report records.', details: err.message });
    }
};