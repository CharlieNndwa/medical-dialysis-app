// FILE: routes/reportRoutes.js (FINAL CORRECTED CODE)

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController'); 
const authMiddleware = require('../middleware/authMiddleware'); // Your JWT middleware

// 1. POST /api/reports - To save a new report
// This calls the createReport function from the controller
router.post('/', authMiddleware, reportController.createReport); 

/**
 * @route   GET /api/reports
 * @desc    Fetch all patient report summary records
 * @access  Private (Requires authentication)
 */
// 🎯 FINAL FIX: This correctly calls reportController.getReports
router.get(
    '/', 
    authMiddleware,
    reportController.getReports // <-- CORRECTED NAME
);

module.exports = router;