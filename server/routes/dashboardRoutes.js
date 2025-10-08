// FILE: routes/dashboardRoutes.js

const express = require('express');
const router = express.Router();

// 🔑 Import the dashboard controller
const dashboardController = require('../controllers/dashboardController');

// 🔑 Import your existing JWT authentication middleware
const authMiddleware = require('../middleware/authMiddleware'); 

// GET /api/dashboard/:patientId - Protected route to fetch all aggregated dashboard data for a single patient
// The patient ID is passed in the URL parameters.
router.get('/:patientId', authMiddleware, dashboardController.getDashboardSummary);

module.exports = router;