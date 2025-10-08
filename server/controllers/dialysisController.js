// FILE: controllers/dialysisController.js

// IMPORTANT: Replace with the actual path to your PostgreSQL connection pool
const db = require('../config/db');

/**
 * @route   POST /api/dialysis-charts
 * @desc    Create a new dialysis chart record for a patient
 * @access  Private (Requires authentication via JWT middleware)
 */
exports.createDialysisChart = async (req, res) => {
    // 🎯 Get the authenticated user ID from your JWT middleware
    const recordedByUserId = req.user.id; 
    
    // Deconstruct fields from the frontend formData (camelCase)
    const { 
        patientId, // Assumed to be passed from the client/route params
        // Treatment Plan
        planType, planDate,
        // Pre-Dialysis
        preDate, preTime, preHB, preBP, prePulse, preGlucose,
        preWeight, preTemp, micturition, ufSet, machineType,
        machineReadings, primedBy,
        // Intra-Dialysis
        connectedBy, intraTime, consumable, additionalConsumable,
        qb, qd, tmp, ufRate, clotting, reason, heparinDose, ironSucrose,
        vitalsIntervals, // Dynamic array of vitals (handled as JSONB)
        // Post-Dialysis
        postDate, postTime, postBP, postPulse, postWeight, 
        postTemp, fluidRemoved, finishedBy,
        // Signature
        signatureImage // Base64 string from SignatureCanvas (handled as TEXT)
    } = req.body;

    const sqlQuery = `
        INSERT INTO dialysis_charts (
            patient_id, recorded_by_user_id,
            plan_type, plan_date,
            pre_date, pre_time, pre_hb, pre_bp, pre_pulse, pre_glucose,
            pre_weight, pre_temp, micturition, uf_set, machine_type,
            machine_readings, primed_by,
            connected_by, intra_time, consumable, additional_consumable,
            qb, qd, tmp, uf_rate, clotting, reason, heparin_dose, iron_sucrose,
            post_date, post_time, post_bp, post_pulse, 
            post_weight, post_temp, fluid_removed, finished_by,
            vitals_intervals, signature_data
        ) 
        VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
            $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29,
            $30, $31, $32, $33, $34, $35, $36, $37,
            $38, $39
        )
        RETURNING id, created_at;
    `;
    
    // Map data to the SQL parameters
    const values = [
        patientId, recordedByUserId, 
        planType, planDate,
        preDate, preTime, preHB, preBP, prePulse, preGlucose,
        preWeight, preTemp, micturition, ufSet, machineType,
        machineReadings, primedBy,
        connectedBy, intraTime, consumable, additionalConsumable,
        qb, qd, tmp, ufRate, clotting, reason, heparinDose, ironSucrose,
        postDate, postTime, postBP, postPulse, 
        postWeight, postTemp, fluidRemoved, finishedBy,
        // Convert the JavaScript array/object to a JSON string for the JSONB column
        JSON.stringify(vitalsIntervals), signatureImage 
    ];

    try {
        const result = await pool.query(sqlQuery, values);

        res.status(201).json({ 
            message: 'Dialysis Chart saved successfully in PostgreSQL!', 
            chartId: result.rows[0].id 
        });

    } catch (err) {
        console.error('PostgreSQL Dialysis Chart Save Error:', err.message);
        // Provide specific feedback for Foreign Key violation
        if (err.code === '23503') { 
            return res.status(400).json({ 
                message: 'Invalid Patient ID or User ID: Foreign key constraint failed.' 
            });
        }
        res.status(500).json({ 
            message: 'Server Error: Could not save dialysis chart due to database issue.', 
            details: err.message 
        });
    }
};