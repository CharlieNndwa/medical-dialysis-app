// FILE: routes/equipmentRoutes.js (CORRECTED CODE)

const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Assuming the path to your DB connection

// 1. POST: Save a new maintenance record
// Route: POST /api/equipment/maintenance
router.post('/maintenance', async (req, res) => {
    // Destructuring fields from the request body
    const { 
        machineMake, serialNumber, maintenanceDate, nextServiceDate, 
        maintenanceType, company, staff, disinfectionTime, notes
    } = req.body;

    // Basic required field validation
    if (!machineMake || !serialNumber || !maintenanceDate) {
        return res.status(400).json({ error: 'Missing required fields: Machine Make, Serial Number, and Maintenance Date.' });
    }

    try {
        const query = `
            INSERT INTO equipment_maintenance_records (
                machine_make, serial_number, maintenance_date, next_service_date, 
                maintenance_type, performed_by_company, performed_by_staff, disinfection_time, notes, recorded_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
            RETURNING *;
        `;
        const values = [
            machineMake, serialNumber, maintenanceDate, nextServiceDate, 
            maintenanceType, company, staff, disinfectionTime, notes
        ];

        // FIX: Use db.pool.query() for database interaction
        const result = await db.pool.query(query, values);
        res.status(201).json({ 
            message: 'Equipment Maintenance Record saved successfully.',
            record: result.rows[0]
        });

    } catch (err) {
        console.error('Database INSERT Error:', err);
        res.status(500).json({ error: 'Failed to save maintenance record.', details: err.message });
    }
});

// 2. GET: Fetch all maintenance records (for the Summary Table)
// Route: GET /api/equipment/maintenance
router.get('/maintenance', async (req, res) => {
    try {
        // Fetch all records, sorted by maintenance date (most recent first)
        const query = `
            SELECT 
                record_id, machine_make, serial_number, maintenance_date, next_service_date, 
                maintenance_type, performed_by_company, performed_by_staff, notes 
            FROM equipment_maintenance_records 
            ORDER BY maintenance_date DESC, recorded_at DESC;
        `;
        
        // FIX: Use db.pool.query() for database interaction
        const result = await db.pool.query(query);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Database GET Error:', err);
        res.status(500).json({ error: 'Failed to fetch maintenance records.', details: err.message });
    }
});


module.exports = router;