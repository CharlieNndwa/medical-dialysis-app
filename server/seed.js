// FILE: seed.js
// Purpose: One-time script to connect to the deployed PostgreSQL database 
// and create all required tables based on existing schema.

require('dotenv').config();
const { Pool } = require('pg');

// Use the same connection logic as your db.js
const isProduction = process.env.NODE_ENV === 'production'; 

let pool;

if (isProduction && process.env.DATABASE_URL) {
    // VERCEL/PRODUCTION CONFIGURATION
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
} else {
    // LOCALHOST/DEVELOPMENT CONFIGURATION
    pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'crm_patient_db',
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT || 5432,
    });
}

// =======================================================
// TABLE CREATION FUNCTIONS (Based on \d output)
// =======================================================

const createUsersTable = async (client) => {
    // Users table exists, but we ensure the structure matches your app logic
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            first_name VARCHAR(100) NOT NULL,  -- Ensure NOT NULL for registration
            last_name VARCHAR(100) NOT NULL,   -- Ensure NOT NULL for registration
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `;
    await client.query(createTableQuery);
    console.log('  -> Users table checked/created.');
};

const createPatientMasterRecordsTable = async (client) => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS patient_master_records (
            patient_id SERIAL PRIMARY KEY,
            full_name VARCHAR(255) NOT NULL,
            date_of_birth DATE,
            gender VARCHAR(10),
            age SMALLINT,
            height NUMERIC(5,2),
            weight NUMERIC(5,2),
            address TEXT,
            contact_details VARCHAR(50),
            next_of_kin TEXT,
            access_type VARCHAR(50),
            diabetic_status BOOLEAN,
            smoking_status BOOLEAN,
            dialysis_modality VARCHAR(50),
            frequency SMALLINT,
            script_duration VARCHAR(50),
            dialyser VARCHAR(50),
            buffer VARCHAR(50),
            qd NUMERIC(5,2),
            qb NUMERIC(5,2),
            anticoagulant VARCHAR(50),
            script_validity_start DATE,
            script_validity_end DATE,
            script_reminder VARCHAR(50) DEFAULT '1 Month',
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
        );
    `;
    await client.query(createTableQuery);
    console.log('  -> Patient Master Records table checked/created.');
};

const createHemodialysisRecordsTable = async (client) => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS hemodialysis_records (
            id SERIAL PRIMARY KEY,
            -- ASSUMED FOREIGN KEY to link to patient_master_records
            patient_id INTEGER REFERENCES patient_master_records(patient_id) ON DELETE CASCADE, 
            session_date DATE NOT NULL,
            pre_weight NUMERIC,
            post_weight NUMERIC,
            duration_hours NUMERIC,
            dialyzer_type VARCHAR(100),
            blood_flow_rate INTEGER,
            dialysate_flow_rate INTEGER,
            -- staff_initials VARCHAR(10), <--- REMOVED THIS LINE
            notes TEXT,
            signature_data TEXT,
            diagnosis VARCHAR(255),
            time_on TIME WITHOUT TIME ZONE,
            time_off TIME WITHOUT TIME ZONE
        );
    `;
    await client.query(createTableQuery);
    console.log('  -> Hemodialysis Records table checked/created.');
};

const createClinicalProgressLogsTable = async (client) => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS clinical_progress_logs (
            log_id SERIAL PRIMARY KEY,
            -- ASSUMED FOREIGN KEY to link to patient_master_records
            patient_id INTEGER REFERENCES patient_master_records(patient_id) ON DELETE CASCADE,
            entry_date_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            log_date_time_action VARCHAR(255) NOT NULL,
            problems_identified_progress_recommendation_education TEXT NOT NULL,
            staff_signature_text VARCHAR(255),
            staff_signature_image TEXT,
            staff_qualification VARCHAR(100) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `;
    await client.query(createTableQuery);
    console.log('  -> Clinical Progress Logs table checked/created.');
};

const createOtherTablesPlaceholder = async (client) => {
    // 💡 REMINDER: You must add the creation code for ALL your other tables here 
    // to prevent crashes on other routes (e.g., patient_master_records_user_id_fkey)
    // If you only have 4 tables, you can ignore this function.
    console.log('  -> Placeholder for other tables executed.');
};


// =======================================================
// EXECUTION BLOCK: Run all functions here
// =======================================================

const runSeed = async () => {
    let client;
    try {
        console.log("Attempting to connect to the database to create tables...");
        client = await pool.connect();
        
        // --- Run all table creation functions ---
        await createUsersTable(client);
        await createPatientMasterRecordsTable(client);
        await createHemodialysisRecordsTable(client);
        await createClinicalProgressLogsTable(client);
        
        // Ensure you run any other table creation functions here!
        await createOtherTablesPlaceholder(client); 

        console.log('\n✅ All Database Tables Checked/Created Successfully!');
    } catch (err) {
        console.error('\n❌ FATAL ERROR during table creation:', err.stack);
        // The error log will point out which table failed if there's a problem.
    } finally {
        if (client) {
            client.release();
            console.log('\nClient connection released. Seeding complete.');
            process.exit(0); 
        }
    }
};

runSeed();