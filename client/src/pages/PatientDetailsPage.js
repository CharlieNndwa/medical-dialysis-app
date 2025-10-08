import React, { useState, useRef, useEffect, useCallback } from 'react'; // 🎯 UPDATED: Added useEffect, useCallback
// 🎯 UPDATE 1: Added FaDownload icon
import {
    FaUpload,
    FaSpinner,
    FaClock,
    FaRedoAlt,
    FaFileAlt,
    FaEye,
    FaTrashAlt,
    FaDownload,
    FaUsers // <--- ADD THIS LINE
} from 'react-icons/fa';
import axios from 'axios';

import { motion } from 'framer-motion';

import './PatientDetails.css';
import ToastNotification from './ToastNotification';


// 🎯 FIX 1: Define the server root and combine it with the specific API route.
// This ensures the POST request always goes to [ROOT]/api/patients
const API_SERVER_ROOT = process.env.REACT_APP_API_URL || 'http://localhost:5000'; 
const PATIENT_API_URL = `${API_SERVER_ROOT}/api/patients`; // This is the correct, full endpoint

// Mock data for dropdowns (UNCHANGED)
const accessTypes = ['AV Fistula', 'Graft', 'Catheter', 'Other'];
const modalities = ['Hemodialysis (HD)', 'HemoDiaFiltration (HDF)', 'Peritoneal Dialysis (PD)'];
const frequencies = [1, 2, 3, 4, 5, 6];
const dialysers = ['F8 HPS', 'FX80', 'Optiflux', 'Other'];
const buffers = ['Bicarbonate', 'Acetate'];
const anticoagulants = ['Heparin', 'Citrate', 'None'];
const reminderPeriods = ['1 Week', '2 Weeks', '1 Month', '3 Months'];


const initialFormData = {
    // Patient Demographics
    fullName: '', address: '', contactDetails: '', nextOfKin: '', age: '', height: '', weight: '',
    gender: '', // ADDED
    dateOfBirth: '', // ADDED
    // Clinical Status
    accessType: '', diabeticStatus: 'N', smokingStatus: 'N',
    // Dialysis Prescription
    dialysisModality: '', // FIX 1: Correct key to match BE
    frequency: 1, 
    prescribedDose: '', // FIX 2: Correct key to match input name and BE expectation (maps to script_duration)
    dialyser: '', buffer: '', qd: '', qb: '', anticoagulant: '',
    scriptValidityStart: '', 
    scriptExpiryDate: '', // FIX 3: Correct key to match input name (maps to script_validity_end)
    scriptReminder: '1 Month',
};

// --- Sub-Component: PatientSummaryTable (New Component) ---
// This component displays all patients and allows selection.
const PatientSummaryTable = ({ records, onSelectPatient }) => {
    // 🎯 FIX 1: Create a safe array. If 'records' is null/undefined, use [] instead.
    const patientRecords = Array.isArray(records) ? records : [];
    
    return (
        <div className="patient-summary-table-container">
            <h3 className="summary-title"><FaUsers /> Existing Patient Records</h3>
            
            {/* 🎯 FIX 2: Use the safe array for length check */}
            {patientRecords.length === 0 ? (
                <p className="no-records-message">No patient records found. Start by saving a new one!</p>
            ) : (
                <div className="summary-table-wrapper">
                    <table className="summary-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Contact</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* 🎯 FIX 3: Map over the safe array */}
                            {patientRecords.map((record) => (
                                <tr key={record.id}> 
                                    <td data-label="ID">{record.id}</td> 
                                    <td data-label="Name">{record.full_name}</td>
                                    <td data-label="Contact">{record.contact_details}</td>
                                    <td data-label="Action">
                                        <button
                                            className="action-select-btn"
                                            onClick={() => onSelectPatient(record.id, record.full_name)}
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const PatientDetailsPage = () => {
    // 🎯 NEW: State for all patient records and the currently selected patient
    const [allPatients, setAllPatients] = useState([]);
     // 🎯 FIX 1: Ensure selectedPatientId and its setter are defined
    // eslint-disable-next-line no-unused-vars
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    // eslint-disable-next-line no-unused-vars
    const [selectedPatientName, setSelectedPatientName] = useState('');
    // eslint-disable-next-line no-unused-vars
    const [tableLoading, setTableLoading] = useState(true); // 🚨 FIX 1: Add state for the table
    const [formData, setFormData] = useState(initialFormData);
    const [toast, setToast] = useState({ open: false, message: '', severity: '' });
    const [loading, setLoading] = useState(false);
    
   
    
    const fetchAllPatients = useCallback(async () => {
        setTableLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(PATIENT_API_URL, {
                headers: { 'x-auth-token': token },
            });

            // 🎯 CRITICAL FIX 1: Safely access patient records from the response. 
            // Assume the data might be in response.data.rows (if coming from pg/node) or response.data.
            // If the structure is non-standard or missing, default to an empty array [].
            const fetchedRecords = response.data?.rows || response.data || [];
            
            // 🎯 CRITICAL FIX 2: Ensure we only set the state if it's an array
            if (Array.isArray(fetchedRecords)) {
                setAllPatients(fetchedRecords);
            } else {
                console.error("API response was not an array:", fetchedRecords);
                setAllPatients([]); // Fallback to empty array
            }
        } catch (error) {
            console.error('Error fetching patients:', error);
            
            // 🎯 CRITICAL FIX 3: On any API error, set the state to an empty array.
            setAllPatients([]); 
            
            setToast({
                open: true,
                message: 'Failed to load patient records. Check server connection.',
                severity: 'error'
            });
        } finally {
            setTableLoading(false);
        }
    }, [setToast]); 

    // UseEffect to fetch data on component mount
    useEffect(() => {
        fetchAllPatients();
    }, [fetchAllPatients]); // fetchAllPatients is guaranteed to be stable thanks to useCallback


    // Handler to select a patient from the table
    const handleSelectPatient = (id, fullName) => { // FIX 2: Handler now receives 'id'
        setSelectedPatientId(id);
        setSelectedPatientName(fullName);
        // FIX 2: Toast now correctly displays the ID passed from the table
        setToast({ open: true, message: `Patient ${fullName} (ID: ${id}) selected.`, severity: 'info' });

        // OPTIONAL: If you want to load the *selected* patient's details into the form:
        // const selectedRecord = allPatients.find(p => p.id === id); // Use 'id' from the aliased column
        // if (selectedRecord) { setFormData(selectedRecord); }
    };


    // State for file attachments and ref for hidden input
    const [attachedFiles, setAttachedFiles] = useState([]);
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleToastClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setToast({ ...toast, open: false });
    };

    // Handler to open the hidden file input
    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    // Handler to process selected files
    const handleFileChange = (event) => {
        const newFiles = Array.from(event.target.files);
        if (newFiles.length > 0) {
            setAttachedFiles(prevFiles => [...prevFiles, ...newFiles]);
        }
        // Clear the file input value so the same file can be uploaded again if necessary
        event.target.value = null;
    };

    /**
     * Handler for viewing a file.
     * Uses URL.createObjectURL to open the content in a new tab.
     */
    const handleViewFile = (file) => {
        if (file instanceof File) {
            const fileURL = URL.createObjectURL(file);
            const newWindow = window.open(fileURL, '_blank');

            if (newWindow) {
                // Revoke the object URL after the window loads to free memory
                newWindow.onload = () => {
                    URL.revokeObjectURL(fileURL);
                };
            } else {
                console.error("Popup blocked. Cannot open file directly.");
            }
        } else {
            console.error("Cannot view file: file object is invalid or not found.");
        }
    };

    /**
     * 🎯 NEW FUNCTION: Handler for downloading a file.
     * Uses URL.createObjectURL and an anchor tag to trigger a download.
     */
    const handleDownloadFile = (file) => {
        if (file instanceof File) {
            // 1. Create a temporary local URL for the file object
            const fileURL = URL.createObjectURL(file);

            // 2. Create a virtual anchor element
            const link = document.createElement('a');
            link.href = fileURL;
            link.setAttribute('download', file.name); // Instructs the browser to download

            // 3. Trigger click and clean up
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up the object URL immediately after download is initiated
            URL.revokeObjectURL(fileURL);

        } else {
            console.error("Cannot download file: file object is invalid or not found.");
        }
    };


    /**
     * Handler for deleting a file.
     * Performs client-side deletion immediately and suppresses the toast.
     */
    const handleDeleteFile = (fileName) => {
        // In a real app, this would be followed by an API call (e.g., axios.delete(url)).

        // Filter out the file to be deleted
        setAttachedFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
        console.log('Action: Deleted file:', fileName);

        // CRUCIAL: No setToast call is present, preventing the notification pop-up.
    };

    // UPDATED: handleReset to clear files
    const handleReset = () => {
        setFormData(initialFormData);
        setAttachedFiles([]); // Clear attached files
        setSelectedPatientId(null);
        setSelectedPatientName('Select a Patient');
        setToast({ open: true, message: 'Form reset successful.', severity: 'info' });
    };



const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setToast({ open: false, message: '', severity: '' });

    try {
        const token = localStorage.getItem('token');
        // Assuming API_BASE_URL points to your patient creation endpoint
        const response = await axios.post(PATIENT_API_URL, formData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        // 🎯 FIX 1: Read the ID correctly from the response object (response.data.patientId)
        const newPatientId = response.data.patientId; 
        const newPatientName = formData.fullName; // Grab the name from the form data itself

        // 🎯 FIX 2: Only show success toast and run side-effects if the POST was successful (status 201 or 200)
        if (response.status === 201 || response.status === 200) {
            setToast({ 
                open: true, 
                message: `New Patient Record for ${newPatientName} (ID: ${newPatientId}) saved successfully!`, 
                severity: 'success' 
            });

            // CRITICAL: Update the summary table and select the new patient
            fetchAllPatients();
            setSelectedPatientId(newPatientId);
            setSelectedPatientName(`ID ${newPatientId}`); 

            setFormData(initialFormData);
        } else {
            // Handle unexpected successful status codes (e.g., 204 No Content)
            setToast({
                open: true,
                message: 'Patient saved, but received an unusual server response status.',
                severity: 'warning'
            });
        }
    } catch (error) {
        // ... (existing error handling for failed save)
        console.error('Error saving patient record:', error.response?.data || error.message);
        setToast({
            open: true,
            message: error.response?.data?.error || 'Failed to save patient record. Please check the console.',
            severity: 'error'
        });
    } finally {
        setLoading(false);
    }
};



    return (
        <div className="patient-form-container">
            <h1 className="page-title">Patient Details Form</h1>

            <div className="patient-form-paper">
                <motion.button
                    type="button"
                    className="global-reset-btn"
                    onClick={handleReset}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <FaRedoAlt style={{ marginRight: '8px' }} />
                    Reset Form
                </motion.button>

                <form onSubmit={handleSubmit}>
                    <div className="form-grid-layout">

                        {/* ========================================= */}
                        {/* SECTION 1: Patient Demographics */}
                        {/* ========================================= */}
                        <div className="grid-item-12 section-header">Patient Demographics</div>

                        <div className="grid-item-6">
                            <div className="input-group">
                                <label htmlFor="fullName">Full Name</label>
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    placeholder="Patient's Full Name"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid-item-6">
                            <div className="input-group">
                                <label htmlFor="address">Address</label>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    placeholder="Residential Address"
                                    value={formData.address}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid-item-3">
                            <div className="input-group">
                                <label htmlFor="contactDetails">Contact Details</label>
                                <input
                                    type="text"
                                    id="contactDetails"
                                    name="contactDetails"
                                    placeholder="Phone/Email"
                                    value={formData.contactDetails}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid-item-3">
                            <div className="input-group">
                                <label htmlFor="nextOfKin">Next of Kin Contact</label>
                                <input
                                    type="text"
                                    id="nextOfKin"
                                    name="nextOfKin"
                                    placeholder="Kin's Name/Contact"
                                    value={formData.nextOfKin}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid-item-2">
                            <div className="input-group">
                                <label htmlFor="age">Age</label>
                                <input
                                    type="number"
                                    id="age"
                                    name="age"
                                    placeholder="Years"
                                    value={formData.age}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* 🎯 FIX 4: ADDED Gender input (was missing in original form, causing null value) */}
                        <div className="grid-item-2">
                            <div className="input-group">
                                <label htmlFor="gender">Gender</label>
                                <select id="gender" name="gender" value={formData.gender} onChange={handleChange}>
                                    <option value="" disabled>Select</option>
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                    <option value="O">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid-item-2">
                            <div className="input-group">
                                <label htmlFor="height">Height (cm)</label>
                                <input
                                    type="number"
                                    id="height"
                                    name="height"
                                    placeholder="e.g., 175"
                                    value={formData.height}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid-item-2">
                            <div className="input-group">
                                <label htmlFor="weight">Weight (kg)</label>
                                <input
                                    type="number"
                                    id="weight"
                                    name="weight"
                                    placeholder="e.g., 75"
                                    value={formData.weight}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* 🎯 FIX 5: ADDED Date of Birth input (was missing in original form) */}
                        <div className="grid-item-4">
                            <div className="input-group">
                                <label htmlFor="dateOfBirth">Date of Birth</label>
                                <input type="date" id="dateOfBirth" name="dateOfBirth"
                                    value={formData.dateOfBirth} onChange={handleChange} />
                            </div>
                        </div>

                        {/* ========================================= */}
                        {/* SECTION 2: Clinical Status */}
                        {/* ========================================= */}
                        <div className="grid-item-12 section-header mt-30">Clinical Status & Health Profile</div>

                        <div className="grid-item-4">
                            <div className="input-group">
                                <label htmlFor="accessType">Vascular Access Type</label>
                                <select
                                    id="accessType"
                                    name="accessType"
                                    value={formData.accessType}
                                    onChange={handleChange}
                                >
                                    <option value="" disabled>Select access type</option>
                                    {accessTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid-item-4">
                            <div className="input-group">
                                <label htmlFor="diabeticStatus">Diabetic Status</label>
                                <select
                                    id="diabeticStatus"
                                    name="diabeticStatus"
                                    value={formData.diabeticStatus}
                                    onChange={handleChange}
                                >
                                    <option value="Y">Yes</option>
                                    <option value="N">No</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid-item-4">
                            <div className="input-group">
                                <label htmlFor="smokingStatus">Smoking Status</label>
                                <select
                                    id="smokingStatus"
                                    name="smokingStatus"
                                    value={formData.smokingStatus}
                                    onChange={handleChange}
                                >
                                    <option value="Y">Yes</option>
                                    <option value="N">No</option>
                                    <option value="F">Former</option>
                                </select>
                            </div>
                        </div>

                        {/* ========================================= */}
                        {/* SECTION 3: Dialysis Prescription */}
                        {/* ========================================= */}
                        <div className="grid-item-12 section-header mt-30">Dialysis Prescription Details</div>

                        {/* 🎯 FIX 6: Renamed name attribute and value key to 'dialysisModality' */}
                        <div className="grid-item-4">
                            <div className="input-group">
                                <label htmlFor="dialysisModality">Dialysis Modality</label>
                                <select id="dialysisModality" name="dialysisModality"
                                    value={formData.dialysisModality} 
                                    onChange={handleChange}
                                >
                                    <option value="" disabled>Select modality</option>
                                    {modalities.map(modality => (
                                        <option key={modality} value={modality}>{modality}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid-item-2">
                            <div className="input-group">
                                <label htmlFor="frequency">Frequency (per week)</label>
                                <select
                                    id="frequency"
                                    name="frequency"
                                    value={formData.frequency}
                                    onChange={handleChange}
                                >
                                    {frequencies.map(f => (
                                        <option key={f} value={f}>{f}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* FIX: scriptDuration renamed to 'prescribedDose' in state, must match input */}
                        <div className="grid-item-2">
                            <div className="input-group">
                                <label htmlFor="prescribedDose">Duration (Hours)</label>
                                <input
                                    type="number"
                                    id="prescribedDose"
                                    name="prescribedDose"
                                    placeholder="e.g., 4"
                                    value={formData.prescribedDose}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        {/* END FIX */}

                        <div className="grid-item-4">
                            <div className="input-group">
                                <label htmlFor="dialyser">Dialyser</label>
                                <select
                                    id="dialyser"
                                    name="dialyser"
                                    value={formData.dialyser}
                                    onChange={handleChange}
                                >
                                    <option value="" disabled>Select dialyser</option>
                                    {dialysers.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid-item-3">
                            <div className="input-group">
                                <label htmlFor="buffer">Buffer</label>
                                <select
                                    id="buffer"
                                    name="buffer"
                                    value={formData.buffer}
                                    onChange={handleChange}
                                >
                                    <option value="" disabled>Select buffer</option>
                                    {buffers.map(b => (
                                        <option key={b} value={b}>{b}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid-item-3">
                            <div className="input-group">
                                <label htmlFor="qd">Qd (mL/min)</label>
                                <input
                                    type="number"
                                    id="qd"
                                    name="qd"
                                    placeholder="e.g., 500"
                                    value={formData.qd}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid-item-3">
                            <div className="input-group">
                                <label htmlFor="qb">Qb (mL/min)</label>
                                <input
                                    type="number"
                                    id="qb"
                                    name="qb"
                                    placeholder="e.g., 300"
                                    value={formData.qb}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid-item-3">
                            <div className="input-group">
                                <label htmlFor="anticoagulant">Anticoagulant</label>
                                <select
                                    id="anticoagulant"
                                    name="anticoagulant"
                                    value={formData.anticoagulant}
                                    onChange={handleChange}
                                >
                                    <option value="" disabled>Select anticoagulant</option>
                                    {anticoagulants.map(a => (
                                        <option key={a} value={a}>{a}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* ========================================= */}
                        {/* SECTION 4: Script Validity */}
                        {/* ========================================= */}
                        <div className="grid-item-12 section-header mt-30">Script Validity & Reminder</div>

                        <div className="grid-item-3">
                            <div className="input-group">
                                <label htmlFor="scriptValidityStart">Validity Start Date</label>
                                <input
                                    type="date"
                                    id="scriptValidityStart"
                                    name="scriptValidityStart"
                                    value={formData.scriptValidityStart}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>


                        <div className="grid-item-3">
                            <div className="input-group">
                                <label htmlFor="scriptExpiryDate">Validity End Date</label>
                                <input type="date" id="scriptExpiryDate" name="scriptExpiryDate"
                                    value={formData.scriptExpiryDate} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="grid-item-3">
                            <div className="input-group">
                                <label htmlFor="scriptReminder">Set Expiry Reminder</label>
                                <select
                                    id="scriptReminder"
                                    name="scriptReminder"
                                    value={formData.scriptReminder}
                                    onChange={handleChange}
                                >
                                    {reminderPeriods.map(p => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid-item-3">
                            {/* Alert text using a custom-styled div */}
                            <div className="custom-alert reminder-alert-style">
                                <span className="alert-icon"><FaClock /></span>
                                <p>Alert set: **{formData.scriptReminder}** before expiry.</p>
                            </div>
                        </div>

                        {/* ATTACH DOCUMENTS FUNCTIONALITY BLOCK */}
                        <div className="grid-item-12 attachment-section">
                            <label className="input-label-styled">Attachments / Documents</label>

                            <div className="upload-group-container">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                    multiple // Allow multiple files
                                />

                                <motion.button
                                    type="button"
                                    className="submit-btn-styled attach-docs-btn"
                                    onClick={handleButtonClick}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <FaUpload style={{ marginRight: '10px' }} />
                                    Attach Documents
                                </motion.button>

                                <span className="file-count-display">
                                    {attachedFiles.length} file(s) attached
                                </span>
                            </div>

                            {/* BLOCK TO DISPLAY ATTACHED FILES with VIEW, DOWNLOAD and DELETE BUTTONS */}
                            {attachedFiles.length > 0 && (
                                <div className="attached-files-container">
                                    <p className="attached-files-title">Attached Files:</p>
                                    {attachedFiles.map((file, index) => (
                                        // Using file name and index as a unique key
                                        <div key={`${file.name}-${index}`} className="attached-file-block">
                                            <FaFileAlt className="file-icon" />
                                            <span className="file-name">{file.name}</span>
                                            <span className="file-size">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>

                                            {/* VIEW BUTTON */}
                                            <motion.button
                                                type="button"
                                                className="file-action-btn view-btn"
                                                onClick={() => handleViewFile(file)}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <FaEye /> View
                                            </motion.button>

                                            {/* 🎯 NEW DOWNLOAD BUTTON */}
                                            <motion.button
                                                type="button"
                                                className="file-action-btn download-btn"
                                                onClick={() => handleDownloadFile(file)}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <FaDownload /> Download
                                            </motion.button>


                                            {/* DELETE BUTTON */}
                                            <motion.button
                                                type="button"
                                                className="file-action-btn delete-btn"
                                                onClick={() => handleDeleteFile(file.name)}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <FaTrashAlt /> Delete
                                            </motion.button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* END ATTACH DOCUMENTS FUNCTIONALITY BLOCK */}

                        {/* SUBMIT BUTTON */}
                        <div className="grid-item-12 center-text mt-40">
                            <div className="form-divider"></div>
                            <motion.button
                                type="submit"
                                className="submit-btn-styled"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={loading} // Disable while saving
                            >
                                {loading ? <><FaSpinner className="spinner" /> SAVING...</> : 'SAVE PATIENT RECORD'}
                            </motion.button>
                        </div>
                    </div>
                </form>
            </div>

            {/* --- 2. PATIENT SUMMARY TABLE --- */}
            <PatientSummaryTable
                records={allPatients}
                onSelectPatient={handleSelectPatient}
                 // REMOVED: setTableLoading is used inside fetchAllPatients, no need to pass it here.
            />



            {/* Custom Toast Notification Integration - Only triggered by Save, Reset, and Upload (if implemented there) */}
            <ToastNotification
                open={toast.open}
                message={toast.message}
                severity={toast.severity}
                onClose={handleToastClose}
            />


        </div>
    );
};

export default PatientDetailsPage;