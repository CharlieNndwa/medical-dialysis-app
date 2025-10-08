// FILE: server/routes/clinicalProgressRoutes.js (FINAL FIX FOR 404)

const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const clinicalProgressController = require('../controllers/clinicalProgressController');

// Route 1: POST - Save new log entries
// FIX: Using '/log' to exactly match the frontend call /api/clinical-progress/log
router.post(
    '/log', // ⬅️ CRITICAL FIX: No dynamic parameters
    authenticateToken,
    clinicalProgressController.saveClinicalProgressLog
);

// 🚀 NEW: GET - Fetch all logs for a patient (Kept, but may conflict with POST logic)
router.get(
    '/:patientId',
    authenticateToken,
    clinicalProgressController.getClinicalProgressLogs
);

module.exports = router;