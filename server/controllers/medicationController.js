// FILE: controllers/medicationController.js

const db = require('../config/db'); // Import the database client

// 🎯 CRITICAL FIX: Changed the exported name to match routes/medicationRoutes.js
exports.createMedicationComorbidities = async (req, res) => {
    // Data expected from the frontend payload
    const {
        patientId, // ⚠️ CRITICAL: Must be sent from the frontend to link to a patient
        medicationSpecify,
        diabetic, cardio, hypercholesterolemia,
        pulmonary, cancer, autoImmune, endocrine,
        otherCoMorbiditySpecify
    } = req.body; 

    // The user ID comes from the JWT payload after authentication
    const createdBy = req.user.id; 

    // Input Validation: Ensure we have a patient ID to link the record
    if (!patientId) {
        return res.status(400).json({ message: "Missing Patient ID. Cannot save record without linking it to a patient." });
    }

    try {
        // Define the SQL INSERT query with parameterized placeholders
        const sqlQuery = `
            INSERT INTO medication_comorbidities (
                patient_id, medication_specify, diabetic, cardio, hypercholesterolemia,
                pulmonary, cancer, auto_immune, endocrine, other_comorbidity_specify,
                created_by
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING id;
        `;
        
        // Define the values array (ensures booleans are stored correctly and prevents SQL Injection)
        const values = [
            patientId,
            medicationSpecify || null,
            diabetic,
            cardio,
            hypercholesterolemia,
            pulmonary,
            cancer,
            autoImmune,
            endocrine,
            otherCoMorbiditySpecify || null,
            createdBy
        ];

        // Execute the query
        const result = await db.query(sqlQuery, values); 
        const newRecordId = result.rows[0].id;

        // Success response
        res.status(201).json({ 
            message: `Medication & Co-morbidities record saved successfully for Patient ${patientId}`, 
            recordId: newRecordId
        });

    } catch (error) {
        console.error("PostgreSQL Error saving Meds/Comorb record:", error);
        res.status(500).json({ 
            message: 'Failed to save medication and co-morbidities record', 
            error: error.message 
        });
    }
};