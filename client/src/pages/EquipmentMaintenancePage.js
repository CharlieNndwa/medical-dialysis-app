import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { FaWrench, FaWater, FaCalendarAlt, FaRedoAlt, FaSpinner, FaCheckCircle, FaTimesCircle, FaListAlt, FaCalendarCheck } from 'react-icons/fa';
import './EquipmentMaintenance.css';

// --- Configuration ---
// Assuming your backend runs on port 5000 (based on saved user info)
const API_URL = 'http://localhost:5000/api/equipment/maintenance';
const getAuthToken = () => localStorage.getItem('jwtToken'); // Placeholder: Use your actual JWT retrieval

// Mock/Dropdown Data 
const maintenanceTypes = ['Routine Filter Change', 'Membrane Replacement', 'Chemical Disinfection', 'Water Analysis', 'Other'];
const machineMakes = ['Fresenius', 'B. Braun', 'Gambro', 'Nikkiso', 'Other'];
const staffNames = ['Dr. Smith', 'Nurse Johnson', 'Tech Williams', 'Admin Clerk'];

// Initial Form Data (PRESERVED)
const initialFormData = {
    machineMake: '',
    serialNumber: '',
    serviceDate: '',
    nextServiceDate: '',
    roMaintType: '',
    waterAnalysisDate: '',
    disinfectionDate: '',
    disinfectionTime: '',
    disinfectedBy: '',
    company: '',
    notes: '' 
};

// Simple Toast Component (For robustness, assumed to be in the same file or a utility)
const StatusToast = ({ message, type }) => {
    const icons = { success: <FaCheckCircle />, error: <FaTimesCircle /> };
    return (
        <motion.div
            className={`em-custom-toast em-status-toast-${type}`}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
            <div className="em-toast-icon">{icons[type]}</div>
            <div className="em-toast-message">{message}</div>
        </motion.div>
    );
};

// =========================================
// NEW: MAINTENANCE SUMMARY TABLE COMPONENT
// =========================================
const MaintenanceSummaryTable = ({ records }) => {
    if (records.length === 0) {
        return (
            <div className="em-empty-state">
                <FaCalendarCheck className="em-empty-icon" />
                <p>No maintenance records found yet.</p>
            </div>
        );
    }

    const formatDate = (isoDate) => {
        if (!isoDate) return 'N/A';
        const date = new Date(isoDate);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div className="em-summary-container">
            <h3 className="page-title summary-title">
                <FaListAlt style={{ marginRight: '10px' }} /> 
                Maintenance Summary Records
            </h3>
            <div className="table-responsive">
                <table className="em-summary-table">
                    <thead>
                        <tr>
                            <th>Machine / Serial</th>
                            <th>Maint. Type</th>
                            <th>Date Performed</th>
                            <th>Next Service</th>
                            <th>Performed By</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map((record) => (
                            <tr key={record.record_id}>
                                <td data-label="Machine / Serial">
                                    <strong>{record.machine_make || 'N/A'}</strong>
                                    <br />
                                    <small>{record.serial_number || 'N/A'}</small>
                                </td>
                                <td data-label="Maint. Type">{record.maintenance_type || 'N/A'}</td>
                                <td data-label="Date Performed">{formatDate(record.maintenance_date)}</td>
                                <td data-label="Next Service">{formatDate(record.next_service_date)}</td>
                                <td data-label="Performed By">
                                    {record.performed_by_staff || record.performed_by_company || 'N/A'}
                                </td>
                                <td data-label="Notes">{record.notes ? record.notes.substring(0, 50) + '...' : 'None'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className='summary-footer'>Showing {records.length} recent records.</p>
        </div>
    );
};
// =========================================


const EquipmentMaintenancePage = () => {
    const [formData, setFormData] = useState(initialFormData);
    const [loading, setLoading] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState('');
    const [saveError, setSaveError] = useState('');
    const [maintenanceRecords, setMaintenanceRecords] = useState([]);
    const [tableLoading, setTableLoading] = useState(true);

    const handleReset = () => {
        setFormData(initialFormData);
        setSaveSuccess('');
        setSaveError('');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    
    // Function to fetch all maintenance records from the backend
    const fetchRecords = async () => {
        setTableLoading(true);
        try {
            const token = getAuthToken();
            const response = await axios.get(API_URL, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMaintenanceRecords(response.data);
        } catch (error) {
            console.error('Error fetching maintenance records:', error);
            setMaintenanceRecords([]); // Show empty table on error
        } finally {
            setTableLoading(false);
        }
    };

    // Load records on component mount
    useEffect(() => {
        fetchRecords();
    }, []);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSaveSuccess('');
        setSaveError('');

        // Map form data to a clean payload for the backend
        const payload = {
            machineMake: formData.machineMake,
            serialNumber: formData.serialNumber,
            maintenanceDate: formData.serviceDate || formData.roMaintDate || formData.waterAnalysisDate || formData.disinfectionDate || formData.otherDate,
            nextServiceDate: formData.nextServiceDate,
            maintenanceType: formData.roMaintType || 'General Service',
            company: formData.company,
            staff: formData.disinfectedBy, 
            disinfectionTime: formData.disinfectionTime,
            notes: formData.notes
        };
        
        try {
            const token = getAuthToken();
            const response = await axios.post(API_URL, payload, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            
            setSaveSuccess(response.data.message || 'Record saved successfully.');
            handleReset(); // Clear form on successful save
            await fetchRecords(); // Refresh the table
        } catch (error) {
            console.error('API Error:', error.response ? error.response.data : error.message);
            setSaveError(error.response?.data?.error || 'Failed to save record. Ensure all required fields are filled.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="maintenance-form-container">
            <h1 className="page-title">
                <FaWrench style={{ marginRight: '15px' }} />
                EQUIPMENT MAINTENANCE RECORD
            </h1>

            <div className="maintenance-form-card">
                <motion.button
                    className="global-reset-btn"
                    onClick={handleReset}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <FaRedoAlt style={{ marginRight: '8px' }} /> Reset Form
                </motion.button>
                
                {/* START: ORIGINAL FORM LAYOUT (PRESERVED) */}
                <form onSubmit={handleSubmit}>
                    <div className="form-grid-layout">
                        {/* 1. MACHINE IDENTIFICATION */}
                        <div className="grid-item-12 form-section-header">
                            <h2>Machine Identification</h2>
                        </div>
                        <div className="grid-item-6 input-group">
                            <label htmlFor="machineMake">Machine Make *</label>
                            <select name="machineMake" id="machineMake" value={formData.machineMake} onChange={handleChange} required>
                                <option value="">Select Make</option>
                                {machineMakes.map(make => <option key={make} value={make}>{make}</option>)}
                            </select>
                        </div>
                        <div className="grid-item-6 input-group">
                            <label htmlFor="serialNumber">Serial Number *</label>
                            <input type="text" name="serialNumber" id="serialNumber" value={formData.serialNumber} onChange={handleChange} placeholder="e.g. SN123456" required />
                        </div>

                        {/* 2. RO MAINTENANCE */}
                        <div className="grid-item-12 form-section-header">
                            <h2><FaWater /> RO Maintenance & Disinfection</h2>
                        </div>
                        <div className="grid-item-4 input-group">
                            <label htmlFor="roMaintDate">RO Maintenance Date</label>
                            <input type="date" name="roMaintDate" id="roMaintDate" value={formData.roMaintDate} onChange={handleChange} />
                        </div>
                        <div className="grid-item-4 input-group">
                            <label htmlFor="roMaintType">Maintenance Type</label>
                            <select name="roMaintType" id="roMaintType" value={formData.roMaintType} onChange={handleChange}>
                                <option value="">Select Type</option>
                                {maintenanceTypes.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>
                        <div className="grid-item-4 input-group">
                            <label htmlFor="waterAnalysisDate">Water Analysis Date</label>
                            <input type="date" name="waterAnalysisDate" id="waterAnalysisDate" value={formData.waterAnalysisDate} onChange={handleChange} />
                        </div>

                        {/* 3. DISINFECTION */}
                        <div className="grid-item-4 input-group">
                            <label htmlFor="disinfectionDate">Disinfection Date</label>
                            <input type="date" name="disinfectionDate" id="disinfectionDate" value={formData.disinfectionDate} onChange={handleChange} />
                        </div>
                        <div className="grid-item-4 input-group">
                            <label htmlFor="disinfectionTime">Disinfection Time</label>
                            <input type="time" name="disinfectionTime" id="disinfectionTime" value={formData.disinfectionTime} onChange={handleChange} />
                        </div>
                        <div className="grid-item-4 input-group">
                            <label htmlFor="disinfectedBy">Disinfected By (Staff Name)</label>
                            <select name="disinfectedBy" id="disinfectedBy" value={formData.disinfectedBy} onChange={handleChange}>
                                <option value="">Select Staff</option>
                                {staffNames.map(name => <option key={name} value={name}>{name}</option>)}
                            </select>
                        </div>

                        {/* 4. SERVICE & NOTES */}
                        <div className="grid-item-12 form-section-header">
                            <h2><FaCalendarAlt /> Full Service Details</h2>
                        </div>
                        <div className="grid-item-4 input-group">
                            <label htmlFor="serviceDate">Service Date</label>
                            <input type="date" name="serviceDate" id="serviceDate" value={formData.serviceDate} onChange={handleChange} />
                        </div>
                        <div className="grid-item-4 input-group">
                            <label htmlFor="nextServiceDate">Next Service Date</label>
                            <input type="date" name="nextServiceDate" id="nextServiceDate" value={formData.nextServiceDate} onChange={handleChange} />
                        </div>
                        <div className="grid-item-4 input-group">
                            <label htmlFor="company">Servicing Company</label>
                            <input type="text" name="company" id="company" value={formData.company} onChange={handleChange} placeholder="e.g. Biomed Services" />
                        </div>
                        
                        <div className="grid-item-12 input-group">
                            <label htmlFor="notes">Notes / Observations</label>
                            <textarea name="notes" id="notes" rows="3" value={formData.notes} onChange={handleChange} placeholder="Detailed notes on maintenance, repairs, or other specifications..."></textarea>
                        </div>

                    </div>
                    {/* SUBMIT BUTTON */}
                    <div className="form-footer">
                        <motion.button 
                            type="submit" 
                            className="submit-btn-styled save-maintenance-blue-btn"
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
                                    <FaWrench style={{ marginRight: '10px' }} />
                                    SAVE MAINTENANCE RECORD
                                </>
                            )}
                        </motion.button>
                    </div>
                </form>
            </div> 
            
            {/* NEW SUMMARY TABLE SECTION */}
            <div className="maintenance-summary-section">
                {tableLoading ? (
                    <div className="em-loading-state">
                        <FaSpinner className="spinner" />
                        <p>Loading Maintenance History...</p>
                    </div>
                ) : (
                    <MaintenanceSummaryTable records={maintenanceRecords} />
                )}
            </div>

            {/* BACKEND FEEDBACK: Custom Framer Motion Toast */}
            <AnimatePresence>
                {saveSuccess && <StatusToast message={saveSuccess} type="success" key="success" />}
                {saveError && <StatusToast message={saveError} type="error" key="error" />}
            </AnimatePresence>
        </div>
    );
};

export default EquipmentMaintenancePage;