// FILE: routes/medicationRoutes.js (FIXED)

const express = require('express');
const router = express.Router();

// 1. Import the controller.
const medicationController = require('../controllers/medicationController'); 

// 🎯 FIX: Import the function directly, NOT using destructuring, 
// since authMiddleware.js uses 'module.exports = function'.
const authenticateToken = require('../middleware/authMiddleware'); 

/**
 * @route   POST /api/medication
 * @desc    Create a new medication/comorbidities record for a patient
 * @access  Private (Requires authentication via JWT middleware)
 */
router.post(
    '/', 
    // 2. The imported function is used correctly as middleware.
    authenticateToken, 
    medicationController.createMedicationComorbidities 
);

// 🔑 CRITICAL: Export the router object
module.exports = router;