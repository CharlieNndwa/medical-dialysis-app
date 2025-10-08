// FILE: controllers/dashboardController.js (UPDATED for Dynamic Time-Filtering)

// IMPORTANT: Replace with your actual DB connection path
const pool = require('../config/db'); 

// Helper to get the start date for filtering based on the time frame
const getTimeFrameStart = (timeFrame) => {
    const now = new Date();
    // Reset to midnight for accurate date comparison
    now.setHours(0, 0, 0, 0); 

    switch (timeFrame) {
        case 'Week':
            // Go back 7 days
            return new Date(now.setDate(now.getDate() - 7));
        case 'Month':
            // Go back 30 days (approximation)
            return new Date(now.setDate(now.getDate() - 30));
        case 'Quarter':
            // Go back 90 days (approximation)
            return new Date(now.setDate(now.getDate() - 90));
        case 'Year':
            // Go back 365 days
            return new Date(now.setDate(now.getDate() - 365));
        default:
            return new Date(0); // Full History if timeFrame is invalid
    }
};


// @route   GET /api/dashboard/:patientId?timeFrame=X
// @desc    Fetch aggregated summary data for the dashboard
// @access  Private (Requires authentication via JWT)
exports.getDashboardSummary = async (req, res) => {
    const { patientId } = req.params;
    // Default to 'Year' if no timeFrame is specified in the query
    const { timeFrame = 'Year' } = req.query; 
    const startDate = getTimeFrameStart(timeFrame);
    
    if (!patientId) {
        return res.status(400).json({ message: 'Patient ID is required.' });
    }
    
    // Array to hold all parallel database promises
    const dbPromises = [];

    // ------------------------------------------------------------------
    // QUERY 1: Sessions Count (Chronic vs. Acute) - Time Filtered
    // ------------------------------------------------------------------
    const sessionsQuery = `
        SELECT 
            SUM(CASE WHEN session_type = 'Chronic' THEN 1 ELSE 0 END) AS chronic_sessions,
            SUM(CASE WHEN session_type = 'Acute' THEN 1 ELSE 0 END) AS acute_sessions
        FROM hemodialysis_records
        WHERE patient_id = $1 AND entry_date_time >= $2;
    `;
    dbPromises.push(pool.query(sessionsQuery, [patientId, startDate]));


    // ------------------------------------------------------------------
    // QUERY 2: Quality Metrics (KTV, URR, Weight - Get Latest Record)
    // We fetch the latest data for the metrics grid, regardless of the time filter.
    // ------------------------------------------------------------------
    const qualityQuery = `
        WITH latest_record AS (
            SELECT *
            FROM hemodialysis_records
            WHERE patient_id = $1
            ORDER BY entry_date_time DESC
            LIMIT 1
        )
        SELECT 
            ktv_per_patient,
            urr_trend,
            intra_dialytic_weight_gain
        FROM latest_record;
    `;
    dbPromises.push(pool.query(qualityQuery, [patientId]));

    // ------------------------------------------------------------------
    // QUERY 3: Patient Details / Reminders (Script, Pathology, Management)
    // (Assuming placeholders for these queries exist, we'll use placeholder promises)
    // NOTE: You must replace these with your actual queries!
    // ------------------------------------------------------------------
    dbPromises.push(Promise.resolve({ rows: [{ script_validity_end: '2026-03-01' }] })); // Script Data
    dbPromises.push(Promise.resolve({ rows: [{ last_test_date: '2025-09-25' }] }));      // Pathology Data
    dbPromises.push(Promise.resolve({ rows: [{ other_management_specify: 'Referral to Cardiology' }] })); // Management Data


    try {
        const [
            sessionsResult, 
            qualityResult, 
            scriptResult, 
            pathologyResult, 
            managementResult
        ] = await Promise.all(dbPromises);

        const sessionsData = sessionsResult.rows[0] || {};
        const qualityData = qualityResult.rows[0] || {};
        const scriptData = scriptResult.rows[0] || {};
        const pathologyData = pathologyResult.rows[0] || {};
        const managementData = managementResult.rows[0] || {};
        
        const summary = {
            // Sessions Summary (Time-Filtered)
            sessions: {
                timeFrame: timeFrame,
                chronic: parseInt(sessionsData.chronic_sessions || 0),
                acute: parseInt(sessionsData.acute_sessions || 0),
            },
            // Quality Metrics (Latest values)
            qualityMetrics: {
                ktvTrend: qualityData.ktv_per_patient || 'N/A',
                urrPerformance: qualityData.urr_trend || 'N/A',
                weightAnalysis: qualityData.intra_dialytic_weight_gain ? `${qualityData.intra_dialytic_weight_gain} kg` : 'N/A',
            },
            // Reminder Dates
            reminders: {
                scriptExpiryDate: scriptData.script_validity_end || 'N/A',
                lastPathologyTest: pathologyData.last_test_date ? new Date(pathologyData.last_test_date).toLocaleDateString() : 'N/A',
                nextFollowUpTask: managementData.other_management_specify || 'No active task',
            }
        };
        
        // Success response
        res.status(200).json(summary);

    } catch (err) {
        console.error('❌ Dashboard Aggregation Error:', err.message);
        res.status(500).json({ 
            message: 'Failed to retrieve dashboard summary.', details: err.message 
        });
    }
};
// Export the function
module.exports = { getDashboardSummary: exports.getDashboardSummary };