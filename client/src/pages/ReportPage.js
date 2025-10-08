// FILE: ReportPage.js (FINAL CODE with Summary Table and Fetch Logic)

import React, { useState, useEffect } from 'react'; // 🎯 UPDATE: Added useEffect for data fetching
import axios from 'axios';
import { motion } from 'framer-motion';
// 🎯 UPDATE: Added FaListAlt and FaSpinner for the summary table and loading state
import { FaFileMedical, FaChartLine, FaPencilAlt, FaRedoAlt, FaSave, FaUserMd, FaListAlt, FaSpinner } from 'react-icons/fa';
import './Report.css';

// 倹 Define the base URL (Using the remembered port 5000)
const API_URL = 'http://localhost:5000/api/reports'; 

const initialFormData = {
    // 泊 New: Patient ID field, required for the backend
    patientId: '', 
    // Generic Section
    sessionsActual: '',
    sessionsPlanned: '',
    ktvPerPatient: '',
    // Weight Analysis is split into a value and a type selector
    weightAnalysisValue: '', 
    weightAnalysisType: 'Pre dialysis', 
    urrTrend: '',
    treatmentPlanVsActual: '',
    consumablesPerPatient: '',
    scheduling: '',
    // Quality Metrics Section
    ktvQuality: '',
    intraDialyticWeightGain: '', // Numerical
    micturation: '',
    haemoglobin: '',
};

// --- Component: Report Summary Table (NEW) ---
const ReportSummaryTable = ({ records }) => {
    if (records.length === 0) {
        return (
            <div className="report-loading-state">
                <p>No reports found. Start by saving a new report above.</p>
            </div>
        );
    }

    return (
        <table className="summary-table-reports">
            <thead>
                <tr>
                    <th>Record ID</th>
                    <th>Patient ID</th>
                    <th>Sessions (A/P)</th>
                    <th>KTV/Pt</th>
                    <th>Hgb</th>
                    <th>Recorded At</th>
                </tr>
            </thead>
            <tbody>
                {records.map((record) => (
                    <tr key={record.id}>
                        <td data-label="Record ID">{record.id}</td>
                        <td data-label="Patient ID">{record.patient_id}</td>
                        <td data-label="Sessions (A/P)">{record.sessions_actual}/{record.sessions_planned}</td>
                        <td data-label="KTV/Pt">{record.ktv_per_patient}</td>
                        <td data-label="Hgb">{record.haemoglobin}</td>
                        <td data-label="Recorded At">{record.recorded_at}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};
// ---------------------------------------------


const ReportPage = () => {
    const [formData, setFormData] = useState(initialFormData);
    const [loading, setLoading] = useState(false);
    const [saveError, setSaveError] = useState(null); 
    const [saveSuccess, setSaveSuccess] = useState(null); 

    // 🎯 NEW: State for the summary table
    const [reportRecords, setReportRecords] = useState([]);
    const [tableLoading, setTableLoading] = useState(true);
    const [tableError, setTableError] = useState(null);

    // Function to fetch all existing records
    const fetchReportRecords = async () => {
        setTableLoading(true);
        setTableError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error("Authentication token not found.");
            }

            const res = await axios.get(API_URL, {
                headers: {
                    'x-auth-token': token,
                },
            });

            setReportRecords(res.data);
            setTableLoading(false);

        } catch (err) {
            console.error('Error fetching report records:', err);
            setTableError('Failed to load report history. Please ensure the backend is running and you are logged in.');
            setTableLoading(false);
        }
    };

    // 🎯 NEW: useEffect to fetch data on component mount
    useEffect(() => {
        fetchReportRecords();
    }, []); // Runs once after the initial render


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleReset = () => {
        setFormData(initialFormData);
        setSaveError(null);
        setSaveSuccess(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSaveError(null);
        setSaveSuccess(null);

        if (!formData.patientId) {
            setSaveError('Patient ID is mandatory for saving a report.');
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error("Authentication token not found.");
            }

            const response = await axios.post(API_URL, formData, {
                headers: {
                    'x-auth-token': token,
                    'Content-Type': 'application/json'
                }
            });

            setSaveSuccess(response.data.message || 'Report saved successfully!');
            handleReset(); // Clear form after successful submission
            fetchReportRecords(); // 🎯 Refresh the summary table data

        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'An unknown error occurred.';
            setSaveError(errorMessage);
            console.error("Report Save Error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="report-form-container">
            <h1 className="page-title">
                <FaChartLine style={{ marginRight: '15px', color: '#3498db' }} /> 
                PATIENT MONTHLY REPORT
            </h1>

            <div className="report-form-card">
                <motion.button 
                    className="global-reset-btn" 
                    onClick={handleReset}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <FaRedoAlt /> Reset
                </motion.button>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-grid-layout">
                        
                        {/* 1. Patient ID - (Keep all your existing form inputs here) */}
                        {/* ... (Your existing form elements are here) ... */}

                        {/* 1. Patient ID */}
                        <div className="grid-section-title">
                            <FaUserMd /> Patient Information
                        </div>
                        <div className="grid-item-6">
                            <div className="form-group">
                                <label htmlFor="patientId">Patient ID <span className="required-star">*</span></label>
                                <input
                                    type="text"
                                    id="patientId"
                                    name="patientId"
                                    placeholder="e.g., PT-12345"
                                    value={formData.patientId}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid-item-6">
                            {/* Empty or can be used for a patient name lookup */}
                        </div>

                        {/* 2. Generic Section */}
                        <div className="grid-item-12">
                            <div className="form-divider"></div>
                        </div>
                        <div className="grid-section-title">
                            <FaFileMedical /> Generic Metrics
                        </div>

                        <div className="grid-item-4">
                            <div className="form-group">
                                <label htmlFor="sessionsActual">Sessions Actual</label>
                                <input type="number" id="sessionsActual" name="sessionsActual" value={formData.sessionsActual} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="grid-item-4">
                            <div className="form-group">
                                <label htmlFor="sessionsPlanned">Sessions Planned</label>
                                <input type="number" id="sessionsPlanned" name="sessionsPlanned" value={formData.sessionsPlanned} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="grid-item-4">
                            <div className="form-group">
                                <label htmlFor="ktvPerPatient">KTV per Patient</label>
                                <input type="text" id="ktvPerPatient" name="ktvPerPatient" placeholder="e.g., 1.5" value={formData.ktvPerPatient} onChange={handleChange} />
                            </div>
                        </div>
                        
                        {/* Row 2 */}
                        <div className="grid-item-4">
                            <div className="form-group">
                                <label htmlFor="weightAnalysisType">Weight Analysis Type</label>
                                <select id="weightAnalysisType" name="weightAnalysisType" value={formData.weightAnalysisType} onChange={handleChange}>
                                    <option value="Pre dialysis">Pre Dialysis</option>
                                    <option value="Post dialysis">Post Dialysis</option>
                                    <option value="Dry weight">Dry Weight</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid-item-4">
                            <div className="form-group">
                                <label htmlFor="weightAnalysisValue">Weight Analysis Value (kg)</label>
                                <input type="number" id="weightAnalysisValue" name="weightAnalysisValue" placeholder="e.g., 75.5" value={formData.weightAnalysisValue} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="grid-item-4">
                            <div className="form-group">
                                <label htmlFor="urrTrend">URR Trend (%)</label>
                                <input type="text" id="urrTrend" name="urrTrend" placeholder="e.g., 65" value={formData.urrTrend} onChange={handleChange} />
                            </div>
                        </div>

                        {/* Row 3 */}
                        <div className="grid-item-12">
                            <div className="form-group">
                                <label htmlFor="treatmentPlanVsActual">Treatment Plan vs Actual (Notes)</label>
                                <textarea id="treatmentPlanVsActual" name="treatmentPlanVsActual" rows="3" placeholder="Document any deviations from the original plan." value={formData.treatmentPlanVsActual} onChange={handleChange} />
                            </div>
                        </div>

                        {/* Row 4 */}
                        <div className="grid-item-6">
                            <div className="form-group">
                                <label htmlFor="consumablesPerPatient">Consumables/Patient (Notes)</label>
                                <textarea id="consumablesPerPatient" name="consumablesPerPatient" rows="3" placeholder="e.g., Higher usage of F8 HPS dialyzer due to clotting." value={formData.consumablesPerPatient} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="grid-item-6">
                            <div className="form-group">
                                <label htmlFor="scheduling">Scheduling Notes</label>
                                <textarea id="scheduling" name="scheduling" rows="3" placeholder="e.g., Patient moved from morning to afternoon shift." value={formData.scheduling} onChange={handleChange} />
                            </div>
                        </div>

                        {/* 3. Quality Metrics Section */}
                        <div className="grid-item-12">
                            <div className="form-divider"></div>
                        </div>
                        <div className="grid-section-title">
                            <FaPencilAlt /> Quality Metrics
                        </div>

                        <div className="grid-item-3">
                            <div className="form-group">
                                <label htmlFor="ktvQuality">KTV Quality</label>
                                <input type="text" id="ktvQuality" name="ktvQuality" placeholder="e.g., Good" value={formData.ktvQuality} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="grid-item-3">
                            <div className="form-group">
                                <label htmlFor="intraDialyticWeightGain">Inter-dialytic Weight Gain (kg)</label>
                                <input type="number" id="intraDialyticWeightGain" name="intraDialyticWeightGain" placeholder="e.g., 2.5" value={formData.intraDialyticWeightGain} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="grid-item-3">
                            <div className="form-group">
                                <label htmlFor="micturation">Micturation</label>
                                <input type="text" id="micturation" name="micturation" placeholder="e.g., Anuric" value={formData.micturation} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="grid-item-3">
                            <div className="form-group">
                                <label htmlFor="haemoglobin">Haemoglobin (g/dL)</label>
                                <input type="text" id="haemoglobin" name="haemoglobin" placeholder="e.g., 11.8" value={formData.haemoglobin} onChange={handleChange} />
                            </div>
                        </div>

                    </div> {/* /form-grid-layout */}
                </form>
            </div> {/* /report-form-card */}
            
            {/* SAVE BUTTON (Fixed and Centered at the bottom) */}
            <div className="grid-item-12 center-text mt-40">
                <motion.button 
                    type="submit" 
                    className="submit-btn-styled"
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
                    ) : 'SAVE PATIENT REPORT'}
                </motion.button>
            </div>

            {/* Status Messages */}
            {saveError && <p style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>Error: {saveError}</p>}
            {saveSuccess && <p style={{ color: 'green', textAlign: 'center', marginTop: '10px' }}>Success: {saveSuccess}</p>}

            {/* 🎯 NEW: SUMMARY TABLE SECTION */}
            <div className="report-summary-section">
                <h2>
                    <FaListAlt style={{ marginRight: '10px' }} /> Report History Summary
                </h2>
                {tableError && <p style={{ color: 'red', textAlign: 'center', marginBottom: '20px' }}>Error: {tableError}</p>}
                {tableLoading ? (
                    <div className="report-loading-state">
                        <FaSpinner className="spinner" />
                        <p>Loading Report History...</p>
                    </div>
                ) : (
                    <ReportSummaryTable records={reportRecords} />
                )}
            </div>

        </div>
    );
};

export default ReportPage;