import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Imported FaSpinner, FaCheckCircle, and FaTimesCircle for status
import { FaVial, FaChartLine, FaChevronDown, FaTint, FaRedoAlt, FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'; 
import './Pathology.css';

// Consolidated list of all tests
const labTests = {
    urea: { label: 'Urea' },
    creatinine: { label: 'Creatinine' },
    egfr: { label: 'e-GFR' },
    hb_pre: { label: 'HB (Pre-Dialysis)' },
    urr: { label: 'URR' },
    hb_post: { label: 'HB (Post-Dialysis)' },
    potassium: { label: 'Potassium' },
};

const preDialysisOptions = ['urea', 'creatinine', 'egfr', 'hb_pre'];
const postDialysisOptions = ['urr', 'hb_post', 'potassium'];

const initialFormData = {
    selectedPreTest: '',
    selectedPostTest: '',
    otherChecked: false,
};

// --- Custom Component to replace MUI Select/FormControl ---
const CustomSelect = ({ name, value, onChange, options, placeholder, disabled, icon: Icon, className }) => {
    const displayLabel = value && labTests[value] ? labTests[value].label : placeholder;

    return (
        <div className={`select-group ${className} ${disabled ? 'select-disabled' : ''}`}>
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                aria-label={placeholder}
            >
                <option value="" disabled>{placeholder}</option>
                {options.map((key) => (
                    <option key={key} value={key}>
                        {labTests[key].label}
                    </option>
                ))}
            </select>
            
            <div className="select-custom-display">
                {Icon && <Icon className="select-icon-left" />}
                <span className="select-value-text">{displayLabel}</span>
                <FaChevronDown className="select-chevron-right" />
            </div>
        </div>
    );
};


// Mock function to retrieve the JWT (replace with your actual utility function)
const getAuthToken = () => {
    // ⚠️ IMPORTANT: Replace this with your actual method of getting the stored JWT
    return localStorage.getItem('token') || 'MOCK_JWT_TOKEN'; 
};

const PathologyPage = () => {
    const [formData, setFormData] = useState(initialFormData);
    const [loading, setLoading] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState('');
    const [saveError, setSaveError] = useState('');

    /* Mutual Exclusion Logic */
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
            // If a valid Pre or Post test is selected, automatically uncheck 'otherChecked' and clear messages
            otherChecked: value !== '' ? false : prevData.otherChecked,
        }));
        setSaveSuccess('');
        setSaveError('');
    };

    /* Mutual Exclusion Logic for Other Button */
    const handleOtherToggle = () => {
        setFormData((prevData) => {
            const newOtherChecked = !prevData.otherChecked;
            
            if (newOtherChecked) {
                // If 'Other Test Selected' is checked, clear both Pre and Post selections
                return {
                    ...prevData,
                    otherChecked: newOtherChecked,
                    selectedPreTest: '',
                    selectedPostTest: '',
                };
            }
            
            // If 'Other Test Selected' is unchecked, just update the toggle state
            return {
                ...prevData,
                otherChecked: newOtherChecked,
            };
        });
        setSaveSuccess('');
        setSaveError('');
    };

    const handleReset = () => {
        setFormData(initialFormData);
        setSaveSuccess('');
        setSaveError('');
        console.log('Pathology Selections Reset.');
    };

    // 🎯 BACKEND INTEGRATION: Updated handleSubmit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSaveSuccess('');
        setSaveError('');

        // ⚠️ IMPORTANT: Replace 'PATIENT_ID_PLACEHOLDER_123' with the actual patient ID (from props, URL, or context)
        const patientId = 'PATIENT_ID_PLACEHOLDER_123'; 
        
        const payload = {
            patientId: patientId,
            selectedPreTestKey: formData.selectedPreTest,
            selectedPostTestKey: formData.selectedPostTest,
            otherTestIncluded: formData.otherChecked,
            // Optional: Include the actual labels if the backend needs them for logs
            preDialysisTestLabel: formData.selectedPreTest ? labTests[formData.selectedPreTest].label : null,
            postDialysisTestLabel: formData.selectedPostTest ? labTests[formData.selectedPostTest].label : null,
        };
        
        // Basic Validation
        if (!payload.selectedPreTestKey && !payload.selectedPostTestKey && !payload.otherTestIncluded) {
             setSaveError('Please select at least one test or check "Other Test Selected".');
             setLoading(false);
             return;
        }

        try {
            const token = getAuthToken();
            const response = await fetch('http://localhost:5000/api/pathology/save', { // ⚠️ Ensure this URL and Port match your backend (5000 or 5001)
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, 
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle server-side errors (e.g., patient ID not found, validation error)
                throw new Error(data.msg || `Server responded with status ${response.status}`);
            }

            console.log('Pathology Selections Sent:', payload);
            setSaveSuccess(data.msg || 'Pathology Test Selections Saved Successfully!');
            
        } catch (error) {
            console.error('Submission Error:', error.message);
            // Provide a user-friendly message for network failures
            setSaveError(error.message.includes('fetch') ? 'Network connection failed. Check server status.' : error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pathology-form-container">
            <h1 className="page-title">
                <FaVial style={{ marginRight: '10px' }} />
                Pathology Lab Test Selection
            </h1>

            <div className="pathology-form-paper">
                <button 
                    type="button" 
                    onClick={handleReset} 
                    className="global-reset-btn"
                >
                    <FaRedoAlt style={{ marginRight: '5px' }} />
                    Reset
                </button>
                
                <form onSubmit={handleSubmit}>
                    <div className="button-stack-wrapper"> 
                        
                        {/* 1. PRE-DIALYSIS DROPDOWN BUTTON */}
                        <CustomSelect 
                            name="selectedPreTest"
                            value={formData.selectedPreTest}
                            onChange={handleChange}
                            options={preDialysisOptions}
                            placeholder="Select Pre-Dialysis Test"
                            disabled={formData.otherChecked || loading} 
                            icon={FaTint}
                            className="pre-dialysis-select"
                        />

                        {/* 2. POST-DIALYSIS DROPDOWN BUTTON */}
                        <CustomSelect 
                            name="selectedPostTest"
                            value={formData.selectedPostTest}
                            onChange={handleChange}
                            options={postDialysisOptions}
                            placeholder="Select Post-Dialysis Test"
                            disabled={formData.otherChecked || loading} 
                            icon={FaTint}
                            className="post-dialysis-select"
                        />
                        
                        {/* 3. OTHER TEST BUTTON: Full width */}
                        <motion.button
                            type="button"
                            onClick={handleOtherToggle}
                            className={`other-test-button ${formData.otherChecked ? 'selected-glow' : ''}`}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={loading}
                        >
                            Other Test Selected
                        </motion.button>
                    </div>

                    {/* Dedicated wrapper for the fixed, centered save button (div replaces Box) */}
                    <div className="fixed-bottom-save-container">
                        <motion.button 
                            type="submit" 
                            className="submit-btn-styled save-pathology-green-btn"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={loading} // Disable during loading
                        >
                            {loading ? (
                                <>
                                    <FaSpinner className="spinner" /> 
                                    <span>SAVING...</span>
                                </>
                            ) : (
                                <>
                                    <FaChartLine style={{ marginRight: '10px' }} />
                                    SAVE TEST SELECTIONS
                                </>
                            )}
                        </motion.button>
                    </div>
                </form>
            </div>

            {/* 🎯 BACKEND FEEDBACK: Custom Framer Motion Toast */}
            <AnimatePresence>
                {(saveSuccess || saveError) && (
                    <motion.div
                        className={`custom-toast ${saveSuccess ? 'custom-toast-success' : 'custom-toast-error'}`}
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 300, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                        {saveSuccess ? <FaCheckCircle className="toast-icon" /> : <FaTimesCircle className="toast-icon" />}
                        <span className="toast-message">{saveSuccess || saveError}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PathologyPage;