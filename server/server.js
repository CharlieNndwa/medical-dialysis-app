// FILE: server.js (FINAL CORRECTED CODE to resolve Foreign Key errors)

require('dotenv').config();
const express = require('express');
const cors = require('cors');

// --- DATABASE AND ROUTE IMPORTS ---
const db = require('./config/db'); 
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const medicalNotesRouter = require('./routes/medicalNotes');
const dialysisRoutes = require('./routes/dialysisRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const medicationRoutes = require('./routes/medicationRoutes');
const reportRoutes = require('./routes/reportRoutes'); 
const patientManagementRoutes = require('./routes/patientManagementRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const hemodialysisRoutes = require('./routes/hemodialysisRoutes');
const clinicalProgressRoutes = require('./routes/clinicalProgressRoutes'); 


const app = express();
const port = process.env.PORT || 5000; 

// Middleware
app.use(cors());
app.use(express.json());

// =======================================================
// DATABASE TABLE CREATION FUNCTIONS
// =======================================================

const createUsersTable = async (client) => {
    const dropTableQuery = `DROP TABLE IF EXISTS users CASCADE;`; 
    const createTableQuery = `
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            first_name VARCHAR(100),
            last_name VARCHAR(100),
            password_hash VARCHAR(255) NOT NULL, 
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );`;
    
    await client.query(dropTableQuery); 
    await client.query(createTableQuery); 

    console.log('✅ PostgreSQL "users" table checked/created successfully.');
};

const createPatientsTable = async (client) => {
    const dropTableQuery = `DROP TABLE IF EXISTS patient_master_records CASCADE;`; 
    
    // Primary Key is SERIAL (Integer)
    const createTableQuery = `
        CREATE TABLE patient_master_records (
            -- Patient Demographics
            patient_id SERIAL PRIMARY KEY, 
            full_name VARCHAR(255) NOT NULL,
            date_of_birth DATE, 
            gender VARCHAR(10),
            age SMALLINT, 
            height NUMERIC(5, 2), 
            weight NUMERIC(5, 2), 
            address TEXT,
            contact_details VARCHAR(50), 
            next_of_kin TEXT, 

            -- Clinical Status
            access_type VARCHAR(50), 
            diabetic_status BOOLEAN, 
            smoking_status BOOLEAN, 

            -- Dialysis Prescription
            dialysis_modality VARCHAR(50), 
            frequency SMALLINT, 
            script_duration VARCHAR(50), 
            dialyser VARCHAR(50), 
            buffer VARCHAR(50), 
            qd NUMERIC(5, 2), 
            qb NUMERIC(5, 2), 
            anticoagulant VARCHAR(50), 
            script_validity_start DATE, 
            script_validity_end DATE, 
            script_reminder VARCHAR(50) DEFAULT '1 Month', 

            -- Other Existing Columns
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
        );`;

    await client.query(dropTableQuery); 
    await client.query(createTableQuery); 

    console.log('✅ PostgreSQL "patient_master_records" table created successfully with SERIAL ID.');
};

const createEquipmentMaintenanceTable = async (client) => {
    const dropTableQuery = `DROP TABLE IF EXISTS equipment_maintenance CASCADE;`; 
    const createTableQuery = `
        CREATE TABLE equipment_maintenance (
            id SERIAL PRIMARY KEY,
            patient_id INTEGER REFERENCES patient_master_records(patient_id) ON DELETE CASCADE, -- 🎯 FIX 2: Changed to INTEGER
            equipment_name VARCHAR(100) NOT NULL,
            last_maintenance DATE,
            next_maintenance DATE,
            status VARCHAR(50)
        );`;

    await client.query(dropTableQuery); 
    await client.query(createTableQuery); 
    console.log('✅ PostgreSQL "equipment_maintenance" table checked/created successfully.');
};


const createHemodialysisTable = async (client) => {
    // 🎯 CRITICAL FIX: Add diagnosis, time_on, and time_off to the schema
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS hemodialysis_records (
            id SERIAL PRIMARY KEY,
            patient_id INTEGER NOT NULL REFERENCES patient_master_records(patient_id) ON DELETE CASCADE,
            session_date DATE NOT NULL,
            pre_weight NUMERIC,
            post_weight NUMERIC,
            duration_hours NUMERIC,
            dialyzer_type VARCHAR(255),
            blood_flow_rate INTEGER,
            dialysate_flow_rate INTEGER,
            staff_initials VARCHAR(100),
            notes TEXT,
            
            -- Columns to be added based on your request:
            diagnosis VARCHAR(255),                  /* NEW */
            time_on TIME WITHOUT TIME ZONE,          /* NEW */
            time_off TIME WITHOUT TIME ZONE,         /* NEW */
            
            signature_data TEXT, 
            
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `;
    await client.query(createTableQuery);
    console.log('✅ PostgreSQL "hemodialysis_records" table checked/created successfully with ALL schema columns.');
};



const createPatientManagementTable = async (client) => {
    const dropTableQuery = `DROP TABLE IF EXISTS patient_management_records CASCADE;`; 
    const createTableQuery = `
        CREATE TABLE patient_management_records (
            id SERIAL PRIMARY KEY,
            patient_id INTEGER REFERENCES patient_master_records(patient_id) ON DELETE CASCADE, -- 🎯 FIX 4: Changed to INTEGER
            record_date DATE NOT NULL,
            diet_plan TEXT,
            social_support TEXT,
            care_coordinator VARCHAR(255),
            status VARCHAR(50)
        );`;

    await client.query(dropTableQuery); 
    await client.query(createTableQuery); 
    console.log('✅ PostgreSQL "patient_management_records" table checked/created successfully.');
};


const createReportRecordsTable = async (client) => {
    const dropTableQuery = `DROP TABLE IF EXISTS patients_report_records CASCADE;`; 
    const createTableQuery = `
        CREATE TABLE patients_report_records (
            id SERIAL PRIMARY KEY,
            patient_id INTEGER REFERENCES patient_master_records(patient_id) ON DELETE CASCADE, -- 🎯 FIX 5: Changed to INTEGER
            report_type VARCHAR(100) NOT NULL,
            report_date DATE NOT NULL,
            file_path TEXT,
            summary TEXT
        );`;

    await client.query(dropTableQuery); 
    await client.query(createTableQuery); 
    console.log('✅ PostgreSQL "patients_report_records" table checked/created successfully.');
};

// =======================================================
// DB CONNECTION, TABLE CREATION & SERVER START
// =======================================================

db.connect()
    .then(async (client) => {
        console.log('✅ PostgreSQL Database Client Acquired for Setup.');
        
        // Ensure the table with the PRIMARY KEY (users) and the one that is referenced (patients)
        // are created before the tables that depend on them.
        await createUsersTable(client); 
        await createPatientsTable(client); 
        
        // These tables now correctly reference the INTEGER patient_id
        await createEquipmentMaintenanceTable(client);
        await createHemodialysisTable(client);
        await createPatientManagementTable(client);
        await createReportRecordsTable(client);

        console.log('✅ PostgreSQL Database Connected Successfully! All tables checked/created.');
        
        client.release();

        app.listen(port, () => {
            console.log(`🚀 Server running on port ${port}`); 
        });
    })
    .catch(err => {
        console.error('❌ Error connecting to PostgreSQL:', err.stack);
        console.log('Server not started due to database connection error.');
    });


// ------------------------------------------------
// APPLICATION ROUTER USAGE
// ------------------------------------------------

// 🚀 FIX: Change the route prefix from '/api/auth' to just '/auth'
app.use('/auth', authRoutes); 
app.use('/api/patients', patientRoutes);
app.use('/api', medicalNotesRouter);
app.use('/api/dialysis', dialysisRoutes);
app.use('/api/hemodialysis', hemodialysisRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/medication', medicationRoutes);
app.use('/api/reports', reportRoutes); 
app.use('/api/patient-management', patientManagementRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/clinical-progress', clinicalProgressRoutes); 

// Simple Health Check/Welcome Route
app.get('/', (req, res) => {
    res.status(200).send('✅ Server Backend is live and ready for API requests.');
});

// CRITICAL VERCEL EXPORT 
module.exports = app;