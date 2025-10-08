// FILE: routes/hemodialysisRoutes.js

const express = require('express');
const router = express.Router();
const db = require('../config/db'); 
const authenticateToken = require('../middleware/authMiddleware');
const hemodialysisController = require('../controllers/hemodialysisController'); 

// --------------------------------------------------------
// POST route: Create a new hemodialysis record
// Route: POST /api/hemodialysis/:patientId/record
// --------------------------------------------------------
router.post(
    '/:patientId/record', 
    authenticateToken, 
    hemodialysisController.saveHemodialysisRecord 
);


// --------------------------------------------------------
// GET route: Fetch ALL hemodialysis records for a patient (Summary Table)
// 🎯 CRITICAL FIX: Changed route from '/:patientId' to '/:patientId/records' 
// to match the front-end's fetch request and avoid conflict with the single record fetch logic.
// Route: GET /api/hemodialysis/:patientId/records 
// --------------------------------------------------------
router.get(
    '/:patientId/records', 
    authenticateToken, 
    hemodialysisController.getHemodialysisRecords 
);


// --------------------------------------------------------
// GET route: Fetch patient master details for form autofill
// Route: GET /api/hemodialysis/patient/:patientId
// --------------------------------------------------------
router.get(
    '/patient/:patientId', 
    authenticateToken, 
    hemodialysisController.getPatientDetailsForChart 
);

module.exports = router;