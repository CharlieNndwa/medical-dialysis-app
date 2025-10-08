// FILE: src/pages/PatientManagementPage.js (FINAL CORRECTED CODE)

import React, { useState, useEffect, useCallback } from 'react'; // 🚨 FIX: Added useCallback
import axios from 'axios'; 
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext'; // 🚨 CRITICAL: Must import useAuth
import {  FaSave, FaCalendarCheck, FaSpinner, FaTimesCircle } from 'react-icons/fa';
import './PatientManagement.css';


// Define the base URL (Use your specific port, e.g., 5000 or 5001)
const API_URL = 'http://localhost:5000/api/patient-management'; 

// --- Component: Status Toast (Cleaned up for use) ---
const StatusToast = ({ message, type }) => {
    // Note: FaTimesCircle was not in the original imports, adding it for the error type
    const icon = type === 'success' ? <FaCalendarCheck /> : <FaTimesCircle />;
    const color = type === 'success' ? '#27ae60' : '#e74c3c';
    
    return (
        <motion.div
            className="status-toast"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            style={{ backgroundColor: color }}
        >
            {icon}
            <span style={{ marginLeft: '10px' }}>{message}</span>
        </motion.div>
    );
};
// -----------------------------------------------------

// --- Component: PatientManagementPage ---
const PatientManagementPage = () => {
 // 🚨 FIX 2: Removed unused 'clearMessages' from destructuring (Line 98)
    const { token } = useAuth();
    

    const [formData] = useState({ /* ... initial form state ... */ });
    const [loading, setLoading] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState('');
    const [saveError, setSaveError] = useState('');
    const [setManagementRecords] = useState([]);
    const [setTableLoading] = useState(false);
    // 🚨 PREVIOUS FIX: Removed 'clearMessages' from a hook call.

 
    const fetchRecords = useCallback(async () => {
        if (!token) {
            setTableLoading(false);
            return;
        }
        setTableLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(API_URL, config);
            setManagementRecords(response.data);
        } catch (err) {
            console.error('Error fetching records:', err);
        } finally {
            setTableLoading(false);
        }
    }, [setManagementRecords, setTableLoading, token]); 

   useEffect(() => {
        fetchRecords(); 
        // Linter is happy because fetchRecords is a stable function reference due to useCallback
    }, [fetchRecords]); 

  

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSaveSuccess('');
        setSaveError('');

        try {
            await axios.post(API_URL, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setSaveSuccess('Management record saved successfully!');
            fetchRecords(); // Refresh the list after saving

        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to save record.';
            setSaveError(msg);
        } finally {
            setLoading(false);
            // Clear success/error messages after a delay
            setTimeout(() => {
                setSaveSuccess('');
                setSaveError('');
            }, 5000);
        }
    };
    
    // ... rest of the component body ...
    
    return (
        <div className="patient-management-container">
            {/* ... Form Structure ... */}

            {/* Submit Button */}
            <div className="grid-item-12 center-text mt-40">
                <motion.button
                    type="submit"
                    className="submit-btn-styled bg-blue"
                    onClick={handleSubmit}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                >
                    <FaSave style={{ marginRight: '10px' }} />
                    {loading ? (
                        <>
                            <FaSpinner className="spinner" /> 
                            <span>SAVING...</span>
                        </>
                    ) : 'SAVE PATIENT MANAGEMENT RECORD'}
                </motion.button>
            </div>

           

            {/* Status Messages - Using the new Toast Component */}
            <AnimatePresence>
                {saveSuccess && <StatusToast message={saveSuccess} type="success" key="success" />}{/* Clear this message after a delay */}
                {saveError && <StatusToast message={saveError} type="error" key="error" />}{/* Clear this message after a delay */}
            </AnimatePresence>
        </div>
    );
};

export default PatientManagementPage;