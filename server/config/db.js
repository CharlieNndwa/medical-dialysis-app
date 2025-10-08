// FILE: server/config/db.js (FINAL CORRECTED CODE)

const { Pool } = require('pg');
// Note: require('dotenv').config() is typically in server/server.js, 
// so you don't need it here.

// 🚨 CRITICAL FIX: Use DATABASE_URL for Vercel, fall back to individual variables locally.
const isProduction = process.env.NODE_ENV === 'production'; 

let pool;

if (isProduction && process.env.DATABASE_URL) {
    // 1. VERCEL/PRODUCTION CONFIGURATION (Uses the single URI)
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            // CRITICAL: Supabase/Vercel typically requires SSL.
            rejectUnauthorized: false
        }
    });

    console.log(`✅ Using DATABASE_URL for Production Connection.`);

} else {
    // 2. LOCALHOST/DEVELOPMENT CONFIGURATION (Uses individual variables from local .env)
    pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT || 5432,
    });
    
    console.log(`✅ Using individual variables for Localhost Connection.`);
}

pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle PostgreSQL client:', err.stack);
});

// 🚀 CRITICAL EXPORT: Export the Pool instance. 
// This is what is imported as 'db' in server.js, and it has the .connect() method.
module.exports = pool;