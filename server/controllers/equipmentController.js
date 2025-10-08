// controllers/equipmentController.js

const db = require('../config/db'); // Import the database client

// Function to add a new equipment maintenance record
exports.addMaintenanceRecord = async (req, res) => {
    // Data expected from the frontend payload
    const {
        roMaintDate, roMaintType, waterAnalysisDate,
        otherDate, otherSpecify, machineMake,
        serialNumber, disinfectionDate, disinfectionTime,
        disinfectedBy, serviceDate, nextServiceDate, company
    } = req.body; 

    // The user ID comes from the JWT payload after authentication
    const createdBy = req.user.id; 

    // Simple validation: Ensure at least one primary field is present
    if (!roMaintDate && !waterAnalysisDate && !serviceDate && !otherDate) {
        return res.status(400).json({ message: "Missing required maintenance data (Date for RO, Water, Service, or Other must be provided)." });
    }

    try {
        // Define the SQL INSERT query with parameterized placeholders
        const sqlQuery = `
            INSERT INTO equipment_maintenance_records (
                ro_maint_date, ro_maint_type, water_analysis_date,
                other_date, other_specify, machine_make,
                serial_number, disinfection_date, disinfection_time,
                disinfected_by, service_date, next_service_date, company,
                created_by
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING id; -- Returns the ID of the newly inserted row
        `;
        
        // Define the values array to prevent SQL Injection
        const values = [
            roMaintDate || null, 
            roMaintType || null, 
            waterAnalysisDate || null,
            otherDate || null, 
            otherSpecify || null, 
            machineMake || null,
            serialNumber || null, 
            disinfectionDate || null, 
            disinfectionTime || null,
            disinfectedBy || null, 
            serviceDate || null, 
            nextServiceDate || null, 
            company || null,
            createdBy
        ];

        // Execute the query
        const result = await db.query(sqlQuery, values); 
        const newRecordId = result.rows[0].id;

        // Success response
        res.status(201).json({ 
            message: 'Equipment maintenance record saved successfully to PostgreSQL', 
            recordId: newRecordId
        });

    } catch (error) {
        console.error("PostgreSQL Error saving maintenance record:", error);
        res.status(500).json({ 
            message: 'Failed to save maintenance record', 
            error: error.message 
        });
    }
};