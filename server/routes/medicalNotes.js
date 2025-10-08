const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// CRITICAL FIX HELPER FUNCTION (Retained from previous step)
const cleanToFloat = (value) => {
    const cleanedString = String(value).replace(/[^\d.]/g, '');
    const floatValue = parseFloat(cleanedString);
    return isNaN(floatValue) ? null : floatValue;
};


// Route to handle form submission (POST)
router.post('/medical-notes', async (req, res) => {
    const client = await pool.connect();
    try {
        let {
            note_year, note_month, name, surname, diagnosis, medical_aid_name, medical_aid_no,
            doctor, access, needle_size, port_length, height, age, dialyzer, dry_weight,
            dialysate_speed_qd, blood_pump_speed_qb, treatment_hours, anticoagulation_and_dose,
            date, time_on, primed_by, stock_utilised, weight, blood_pressure, pulse,
            blood_glucose, temperature, hgt, saturation, post_connection_bp,
            pre_disconnection_bp, post_disconnection_bp, w_post, qd_post, qb_post, uf, ktv,
            time_of, disconnected_by
        } = req.body;

        // CRITICAL SERVER-SIDE DATA CLEANUP (Retained)
        note_year = cleanToFloat(note_year);
        note_month = cleanToFloat(note_month);
        height = cleanToFloat(height);
        age = cleanToFloat(age);
        dry_weight = cleanToFloat(dry_weight);
        dialysate_speed_qd = cleanToFloat(dialysate_speed_qd);
        blood_pump_speed_qb = cleanToFloat(blood_pump_speed_qb);
        treatment_hours = cleanToFloat(treatment_hours);
        weight = cleanToFloat(weight);
        pulse = cleanToFloat(pulse);
        blood_glucose = cleanToFloat(blood_glucose);
        temperature = cleanToFloat(temperature);
        hgt = cleanToFloat(hgt);
        saturation = cleanToFloat(saturation);
        w_post = cleanToFloat(w_post);
        qd_post = cleanToFloat(qd_post);
        qb_post = cleanToFloat(qb_post);
        uf = cleanToFloat(uf);
        ktv = cleanToFloat(ktv);


        // Start a transaction to ensure all inserts are successful
        await client.query('BEGIN');

        // 1. Insert into medical_notes and get the new ID
        const insertNoteQuery = `
            INSERT INTO medical_notes (note_year, note_month)
            VALUES ($1, $2)
            RETURNING id;
        `;
        const noteResult = await client.query(insertNoteQuery, [note_year, note_month]);
        const noteId = noteResult.rows[0].id;

        // 2. Insert into other tables using the returned noteId
        const insertGeneralDetailsQuery = `
            INSERT INTO general_details (note_id, name, surname, diagnosis, medical_aid_name, medical_aid_no, doctor, access, needle_size, port_length, height, age)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);
        `;
        await client.query(insertGeneralDetailsQuery, [noteId, name, surname, diagnosis, medical_aid_name, medical_aid_no, doctor, access, needle_size, port_length, height, age]);

        // 3. Insert into dialysis_prescription
        const insertDialysisPrescriptionQuery = `
            INSERT INTO dialysis_prescription (note_id, dialyzer, dry_weight, dialysate_speed_qd, blood_pump_speed_qb, treatment_hours, anticoagulation_and_dose)
            VALUES ($1, $2, $3, $4, $5, $6, $7);
        `;
        await client.query(insertDialysisPrescriptionQuery, [noteId, dialyzer, dry_weight, dialysate_speed_qd, blood_pump_speed_qb, treatment_hours, anticoagulation_and_dose]);

        // 4. Insert into session_details
        const insertSessionDetailsQuery = `
            INSERT INTO session_details (note_id, date, time_on, primed_by, stock_utilised)
            VALUES ($1, $2, $3, $4, $5);
        `;
        await client.query(insertSessionDetailsQuery, [noteId, date, time_on, primed_by, stock_utilised]);

        // 5. Insert into pre_assessment
        const insertPreAssessmentQuery = `
            INSERT INTO pre_assessment (note_id, weight, blood_pressure, pulse, blood_glucose, temperature, hgt, saturation, post_connection_bp)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
        `;
        await client.query(insertPreAssessmentQuery, [noteId, weight, blood_pressure, pulse, blood_glucose, temperature, hgt, saturation, post_connection_bp]);

        // 6. Insert into post_dialysis
        const insertPostDialysisQuery = `
            INSERT INTO post_dialysis (note_id, pre_disconnection_bp, post_disconnection_bp, w_post, qd_post, qb_post, uf, ktv, time_of, disconnected_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
        `;
        await client.query(insertPostDialysisQuery, [noteId, pre_disconnection_bp, post_disconnection_bp, w_post, qd_post, qb_post, uf, ktv, time_of, disconnected_by]);

        await client.query('COMMIT');
        res.status(201).json({ message: 'Medical note saved successfully', noteId });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Failed to save medical note:', error);
        res.status(500).json({ error: 'Failed to save medical note' });
    } finally {
        client.release();
    }
});


// 💥 CRITICAL BACK-END FIX: Fetching Records (GET)
router.get('/medical-notes', async (req, res) => {
    const client = await pool.connect();
    try {
        const query = `
            SELECT
                mn.id,
                gd.name,
                gd.surname,
                gd.diagnosis,
                gd.doctor,
                sd.date,
                dp.dialyzer,
                pa.weight,
                mn.note_year,
                mn.note_month
            FROM medical_notes mn
            JOIN general_details gd ON mn.id = gd.note_id
            JOIN session_details sd ON mn.id = sd.note_id
            JOIN dialysis_prescription dp ON mn.id = dp.note_id
            JOIN pre_assessment pa ON mn.id = pa.note_id
            ORDER BY sd.date DESC, sd.time_on DESC;
        `;

        const result = await client.query(query);
        // FIX: Always return 200 OK with the array, even if empty.
        res.json(result.rows); 

    } catch (error) {
        console.error('Error fetching medical notes:', error);
        res.status(500).json({ error: 'Failed to retrieve records.' });
    } finally {
        client.release();
    }
});

module.exports = router;