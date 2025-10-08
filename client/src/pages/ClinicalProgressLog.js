import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaSignature, FaGraduationCap, FaSave, FaCheckCircle, FaPlus } from 'react-icons/fa';
import './ClinicalProgressLogUnique.css';
import LogEntryRow from './LogEntryRow'; // 🎯 Import the new row component
import ClinicalProgressTable from './ClinicalProgressTable';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; 

// 🎯 API URL - Using your specified port 5000 and a generic log endpoint
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/clinical-progress';
const LOG_ENDPOINT = `${API_BASE_URL}/log`; // Assuming your backend accepts POST at /api/clinical-progress/log

// --- Initial State for a single log entry ---
const initialLogEntry = {
    dateTime: '',
    action: '',
    notes: '',
    signatureText: '', // For typed name (optional)
    signatureImage: '', // Base64 image data from canvas
    qualification: '',
};

const ClinicalProgressLog = () => {
    const { token } = useAuth(); // Retrieve token for API calls
    // We only need to manage the state array here
    const [logEntries, setLogEntries] = useState([
        {
            ...initialLogEntry,
            dateTime: new Date().toLocaleString(),
            id: Date.now() // Unique ID for keying
        }
    ]);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // This single handler is passed down to update any field in a specific row
    const handleEntryChange = (index, field, value) => {
        setLogEntries(prevEntries =>
            prevEntries.map((entry, i) =>
                i === index ? { ...entry, [field]: value } : entry
            )
        );
    };

    // Adds a new blank log entry row
    const addLogEntryRow = () => {
        setLogEntries(prevEntries => [
            ...prevEntries,
            {
                ...initialLogEntry,
                dateTime: new Date().toLocaleString(),
                id: Date.now() + prevEntries.length
            }
        ]);
    };

    // Removes a log entry row
    const removeLogEntryRow = (indexToRemove) => {
        setLogEntries(prevEntries => prevEntries.filter((_, index) => index !== indexToRemove));
    };



    // Submits the form data
const handleSubmit = async (e) => {
    e.preventDefault();

    const finalLogEntries = logEntries;

    console.log('Clinical Progress Log Submitted:', finalLogEntries);

    // 🚀 API Logic Replacement 🚀
    try {
        const response = await axios.post(
            LOG_ENDPOINT, // The full API endpoint (e.g., http://localhost:5000/api/clinical-progress/log)
            { logEntries: finalLogEntries }, // The data to send in the request body
            {
                headers: {
                    // CRITICAL: Include the token for authentication (Auth is sorted!)
                    'Authorization': `Bearer ${token}` 
                }
            }
        );

        // Check for a successful response (typically 200 or 201)
        if (response.status === 201 || response.status === 200) {
            // Success State Handling
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);

            // Clear the form after successful submission
            setLogEntries([
                { 
                    ...initialLogEntry, 
                    dateTime: new Date().toLocaleString(), 
                    id: Date.now() 
                }
            ]);
            console.log('Server response:', response.data);
        }

    } catch (error) {
        // Robust error handling to show a useful message
        let errorMessage = 'Failed to save log due to an unknown error.';
        if (error.response) {
            // Server responded with an error status (4xx, 5xx)
            errorMessage = error.response.data.error || error.response.data.message || `Server Error: ${error.response.status}`;
        } else if (error.request) {
            // Request was made but no response (Network error, or server is down)
            errorMessage = 'No response from server. Check your backend connection.';
        } else {
            // Something happened in setting up the request
            errorMessage = error.message;
        }

        console.error('Submission Error:', errorMessage);
        alert(`Failed to save log: ${errorMessage}`);
    }
};

    return (
        <div className="cpl-main-wrapper">
            <h1 className="cpl-page-heading">
                Clinical Progress Log
            </h1>

            <div className="cpl-form-paper-card">
                

                <form onSubmit={handleSubmit} className="cpl-log-form">
                    <div className="cpl-table-container">
                        {/* Table Header (UNMODIFIED) */}
                        <div className="cpl-table-header-row">
                            <div className="cpl-header-item cpl-date-time-action-header">
                                <FaCalendarAlt style={{ marginRight: '5px' }} />
                                Date, Time, Action
                            </div>
                            <div className="cpl-header-item cpl-problems-header">
                                Problems Identified / Progress / Recommendation / Education Given
                            </div>
                            <div className="cpl-header-item cpl-signature-header">
                                <FaSignature style={{ marginRight: '5px' }} />
                                Signature
                            </div>
                            <div className="cpl-header-item cpl-qualification-header">
                                <FaGraduationCap style={{ marginRight: '5px' }} />
                                Qualification
                            </div>
                            <div className="cpl-header-item cpl-action-col-header">
                                Actions
                            </div>
                        </div>

                        {/* Table Body - Rows of Log Entries */}
                        <div className="cpl-table-body">
                            {logEntries.map((entry, index) => (
                                <LogEntryRow
                                    key={entry.id} // CRUCIAL for performance and unique hook instances
                                    entry={entry}
                                    index={index}
                                    totalRows={logEntries.length}
                                    onUpdate={handleEntryChange}
                                    onRemove={removeLogEntryRow}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Add Row Button */}
                    <div className="cpl-add-row-section">
                        <motion.button
                            type="button"
                            className="cpl-add-row-btn"
                            onClick={addLogEntryRow}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FaPlus style={{ marginRight: '8px' }} />
                            Add New Log Entry
                        </motion.button>
                    </div>

                    {/* Submit Button */}
                    <div className="cpl-submit-section">
                        <motion.button
                            type="submit"
                            className="cpl-submit-action-btn"
                            disabled={!token} // ⬅️ Add this line
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <FaSave style={{ marginRight: '10px' }} />
                            SAVE CLINICAL PROGRESS LOG
                        </motion.button>
                    </div>
                </form>
            </div>

             {/* 🚀 NEW SECTION: Display the saved/current log entries immediately below the form */}
            <div className="cpl-display-history-section">
                <ClinicalProgressTable records={logEntries} /> 
            </div>

            {/* Framer Motion Toast for Save/Reset Confirmation */}
            <AnimatePresence>
                {saveSuccess && (
                    <motion.div
                        className="cpl-custom-toast cpl-toast-success"
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 300, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                        <FaCheckCircle className="cpl-toast-icon" />
                        <span className="cpl-toast-message">
                            Clinical Progress Log Saved Successfully!
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ClinicalProgressLog;