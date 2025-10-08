// FILE: routes/patientManagementRoutes.js (FULL CORRECTED CODE)

const express = require('express');
const router = express.Router();
const patientManagementController = require('../controllers/patientManagementController');
const authenticateToken = require('../middleware/authMiddleware'); 

/**
 * @route   POST /api/patient-management
 * @desc    Create a new patient management/follow-up record
 * @access  Private
 */
router.post(
    '/', 
    authenticateToken, 
    patientManagementController.createPatientManagementRecord
);

/**
 * @route   GET /api/patient-management
 * @desc    Fetch all patient management summary records
 * @access  Private
 */
// 🎯 CRITICAL: This GET route is required for your table to load.
router.get(
    '/',
    authenticateToken,
    patientManagementController.getPatientManagementRecords
);

module.exports = router;