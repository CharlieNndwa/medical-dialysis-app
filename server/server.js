// FILE: server.js (CORRECTED FOR VERCEL DEPLOYMENT)

require('dotenv').config();
const express = require('express');
const cors = require('cors');

// --- DATABASE AND ROUTE IMPORTS ---
// db.js is correctly configured to use the pool object directly for queries
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
// const port = process.env.PORT || 5000; // REMOVED: Vercel sets the port

// Middleware
app.use(cors());
app.use(express.json());

// ------------------------------------------------
// APPLICATION ROUTER USAGE
// ------------------------------------------------

// 🎯 FIX 1: The /auth route must match the client exactly (no /api prefix)
app.use('/auth', authRoutes); // FIX: Changed from /api/auth

// Note: Other routes still use /api/ for different client calls/logic
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


// Simple Health Check/Welcome Route (Vercel Entry Point)
app.get('/', (req, res) => {
    // This route is the serverless function handler.
    res.status(200).send('✅ Server is Running and Ready for API Requests!');
});

// ❌ CRITICAL FIX 2: REMOVE ALL DATABASE CONNECTION AND app.listen() LOGIC.
// Vercel expects the application to be exported.

module.exports = app; // 🎯 CRITICAL: Export the app for Vercel