import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Added icons for status/loading
import { FaPills, FaHeartbeat, FaSyringe, FaRedoAlt, FaBug, FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'; 
import './MedicationComorbidities.css';

// --- Configuration ---
const API_BASE_URL = `http://localhost:${5000}`; // 🎯 Using your configured port 5000/5001

const getAuthToken = () => {
    // ⚠️ CRITICAL: Replace this mock function with your actual JWT retrieval logic (e.g., from localStorage or a Context/Redux store)
    return localStorage.getItem('token') || 'MOCK_JWT_TOKEN'; 
};

const initialFormData = {
    // ⚠️ CRITICAL: This MUST be dynamically set based on the patient currently being viewed/edited.
    patientId: 1, 
    // Medication
    medicationSpecify: '',
    // Co-morbidities (Checkboxes)
    diabetic: false,
    cardio: false,
    hypercholesterolemia: false,
    pulmonary: false,
    cancer: false,
    autoImmune: false,
    endocrine: false,
    // Other Co-morbidity
    otherCoMorbiditySpecify: '',
};

const comorbiditiesList = [
    { name: 'diabetic', label: 'Diabetic', icon: FaSyringe },
    { name: 'cardio', label: 'Cardio', icon: FaHeartbeat },
    { name: 'hypercholesterolemia', label: 'Hypercholesterolemia', icon: FaPills },
    { name: 'pulmonary', label: 'Pulmonary', icon: FaHeartbeat },
    { name: 'cancer', label: 'Cancer', icon: FaSyringe },
    { name: 'autoImmune', label: 'Auto immune', icon: FaBug }, 
    { name: 'endocrine', label: 'Endocrine', icon: FaPills },
];


// --- Status Toast Component for User Feedback ---
const StatusToast = ({ message, type }) => {
    const isSuccess = type === 'success';
    // Using custom-toast classes which are typically defined in your CSS for this architecture
    return (
        <motion.div
            className={`custom-toast ${isSuccess ? 'custom-toast-success' : 'custom-toast-error'}`}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
            {isSuccess ? <FaCheckCircle className="toast-icon" /> : <FaTimesCircle className="toast-icon" />}
            <span className="toast-message">{message}</span>
        </motion.div>
    );
};


const MedicationComorbiditiesPage = () => {
    const [formData, setFormData] = useState(initialFormData);
    // 🎯 NEW STATE: For handling API status and loading
    const [loading, setLoading] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState('');
    const [saveError, setSaveError] = useState('');


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear previous status on any input change
        setSaveSuccess('');
        setSaveError('');
    };

    const handleReset = () => {
        setFormData(initialFormData);
        setSaveSuccess('');
        setSaveError('');
        console.log('Form reset!');
    };

    // 🎯 BACKEND INTEGRATION: Updated handleSubmit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSaveSuccess('');
        setSaveError('');

        if (!formData.patientId) {
             setSaveError('A Patient ID is required to link this record.');
             setLoading(false);
             return;
        }

        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/api/medication/records`, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // 🔑 Uses your sorted user authentication [cite: 2025-08-30]
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                // Throw an error to be caught below
                throw new Error(data.message || `Server responded with status ${response.status}`);
            }

            console.log('Medication & Co-morbidities Data Saved:', data);
            setSaveSuccess(data.message || `Record saved with ID: ${data.recordId}`);
            
        } catch (error) {
            console.error('Submission Error:', error.message);
            // Provide a user-friendly error message
            setSaveError(error.message.includes('fetch') ? 
                'Network error. Please check your backend server.' : 
                error.message
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="meds-comorb-form-container">
            <h1 className="page-title">
                <FaPills style={{ marginRight: '15px' }} />
                Medication & Co-morbidities
            </h1>

            <div className="meds-comorb-form-card">
                <button 
                    type="button"
                    // 🎯 Updated class to match the typical architecture placement
                    className="global-reset-btn" 
                    onClick={handleReset}
                    disabled={loading} 
                >
                    <FaRedoAlt style={{ marginRight: '5px' }} />
                    Reset
                </button>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-grid-layout">
                        
                        {/* 1. Medication Section */}
                        <div className="form-section full-width">
                            <h2 className="section-heading-card">
                                <FaPills /> Current Medication
                            </h2>
                            <div className="input-group full-width">
                                <label htmlFor="medicationSpecify">Specify Current Medication and Dosages</label>
                                <textarea
                                    id="medicationSpecify"
                                    name="medicationSpecify"
                                    rows="4"
                                    placeholder="e.g., Aspirin 81mg OD, Folic Acid 5mg OD, Calcitriol 0.25mcg BD"
                                    value={formData.medicationSpecify}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* 2. Co-morbidities Section */}
                        <div className="form-section full-width">
                            <h2 className="section-heading-card">
                                <FaHeartbeat /> Other Illness / Co-morbidity
                            </h2>
                            <div className="co-morbidity-checks-grid">
                                {comorbiditiesList.map((item) => (
                                    <div 
                                        key={item.name} 
                                        className={`checkbox-group ${formData[item.name] ? 'is-checked' : ''}`}
                                    >
                                        <input
                                            type="checkbox"
                                            id={item.name}
                                            name={item.name}
                                            checked={formData[item.name]}
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                        <label htmlFor={item.name} className="checkbox-label">
                                            <item.icon className="check-icon" />
                                            {item.label}
                                        </label>
                                    </div>
                                ))}
                            </div>

                            {/* Other Co-morbidity Specify Field */}
                            <div className="input-group full-width other-specify-input" style={{ marginTop: '20px' }}>
                                <label htmlFor="otherCoMorbiditySpecify">Other Co-Morbidity: Specify</label>
                                <input
                                    type="text"
                                    id="otherCoMorbiditySpecify"
                                    name="otherCoMorbiditySpecify"
                                    placeholder="If 'Other' is checked, please specify..."
                                    value={formData.otherCoMorbiditySpecify}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                    </div> {/* /form-grid-layout */}
                    
                    {/* SAVE BUTTON */}
                    <div className="form-footer">
                        <motion.button 
                            type="submit" 
                            className="submit-btn-styled save-meds-comorb-blue-btn"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <FaSpinner className="spinner" /> 
                                    <span>SAVING...</span>
                                </>
                            ) : (
                                <>
                                    <FaPills style={{ marginRight: '10px' }} />
                                    SAVE MEDICATION & RECORDS
                                </>
                            )}
                        </motion.button>
                    </div>
                </form>
            </div> {/* /meds-comorb-form-card */}
            
            {/* BACKEND FEEDBACK: Custom Framer Motion Toast */}
            <AnimatePresence>
                {(saveSuccess || saveError) && (
                    <StatusToast 
                        message={saveSuccess || saveError} 
                        type={saveSuccess ? 'success' : 'error'} 
                        key="status-toast"
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default MedicationComorbiditiesPage;