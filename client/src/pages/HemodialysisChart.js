// FILE: HemodialysisChart.js (FINAL CORRECTED CODE)

import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
// 🎯 ADDED FaSearch icon for the search bar
import { FaUserMd, FaSpinner, FaHeartbeat, FaClock, FaSyringe, FaRedoAlt, FaCheckCircle, FaPlus, FaMinusCircle, FaVial, FaSearch } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import SignatureCanvas from 'react-signature-canvas';
import './HemodialysisChartUnique.css';



const API_SERVER_ROOT = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const HEMODIALYSIS_API_URL = `${API_SERVER_ROOT}/api/hemodialysis`;

// Mock data (UNCHANGED)
const accessOptions = ['AV Fistula', 'Graft', 'Catheter', 'Other'];
const dialyzerOptions = ['F8 HPS', 'FX80', 'Optiflux', 'Other'];
const staffNames = ['Dr. Smith', 'Nurse Jane', 'Nurse David', 'Tech Leo'];
const timeIntervalsHeader = ['Hourly', 'BP', 'AP', 'VP'];

// Initial form data (UNCHANGED)
const initialFormData = {
  // Patient Info
  name: '', surname: '', diagnosis: '', doctor: '', age: '', height: '',
  medicalAidName: '', medicalAidNo: '',
  // Dialysis Parameters
  access: '', needleSize: '', portLength: '',
  dialyzer: '', dryWeight: '', dialysateSpeedQd: '', bloodPumpSpeedQb: '',
  treatmentHours: '', anticoagulationAndDose: '',
  // Pre-Dialysis Setup/Vitals
  preDate: '', timeOn: '', primedBy: '', stockUtilised: '',
  preWeight: '', preBP: '', prePulse: '', preBloodGlucose: '',
  preTemperature: '', hgt: '', saturation: '', postConnectionBP: '',
  // Time Intervals (The Dynamic Section)
  time_intervals: [
    { time: 'H1', bp: '', ap: '', vp: '' },
  ],
  // Post-Dialysis Results
  preDisconnectionBP: '', postDisconnectionBP: '', postWeight: '',
  postQd: '', postQb: '', postUf: '', postKtv: '', timeOff: '', disconnectedBy: '',
  // Signature
  signature_data: null,
};

// --- Sub-Component: Dynamic Time Intervals Table (UNCHANGED) ---
const TimeIntervalsTable = ({ timeIntervals, handleTimeIntervalChange, addTimeInterval, removeTimeInterval }) => (
  // ... (Code for TimeIntervalsTable component omitted for brevity) ...
  <div className="hd-section-card hd-time-intervals-section">
    <h2 className="hd-section-title"><FaClock /> Time Interval Readings</h2>
    <div className="hd-table-container">
      <table className="hd-interval-table">
        <thead>
          <tr>
            {timeIntervalsHeader.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {timeIntervals.map((interval, index) => (
            <motion.tr
              key={index}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <td className="hd-interval-time">{`H${index + 1}`}</td>
              {['bp', 'ap', 'vp'].map((field) => (
                <td key={field}>
                  <input
                    type="text"
                    value={interval[field]}
                    onChange={(e) => handleTimeIntervalChange(index, field, e.target.value)}
                    className="hd-input-field hd-interval-input"
                    placeholder={field.toUpperCase()}
                  />
                </td>
              ))}
              <td>
                {index > 0 ? (
                  <motion.button
                    type="button"
                    className="hd-remove-btn"
                    onClick={() => removeTimeInterval(index)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FaMinusCircle />
                  </motion.button>
                ) : (
                  <span className="hd-spacer">-</span>
                )}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="hd-add-interval-row">
      <motion.button
        type="button"
        className="hd-add-btn"
        onClick={addTimeInterval}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaPlus /> Add Hourly Reading
      </motion.button>
    </div>
  </div>
);


const HemodialysisSummaryTable = ({ records }) => {
  if (!records || records.length === 0) {
    return <p className="hd-no-records-message">No hemodialysis records found for this patient.</p>;
  }

  const tableHeaders = [
    'Patient ID',
    'Name',
    'Diagnosis',
    'Time On',
    'Time Off',
    'Pre-Weight (kg)',
    'Post-Weight (kg)',
    'Disconnected By'
  ];

  return (
    <div className="hd-summary-table-container">
      <h3 className="hd-summary-title">Hemodialysis Record Summary</h3>
      <table className="hd-summary-table">
        <thead>
          <tr className="hd-summary-table-header">
            {tableHeaders.map(header => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((record) => {
            // 🎯 FIX 1: Split full_name into name and surname for display, 
            // as the backend is only returning full_name from patient_master_records.
            const [firstName, ...restName] = (record.full_name || '').split(' ');
            const surname = restName.join(' ') || 'N/A';
            
            return (
              // 🎯 FIX 2: record.id is record_id from the alias in the controller
              <tr key={record.record_id} className="hd-summary-table-row"> 
                <td data-label="Patient ID">{record.patient_id}</td>
                {/* 🎯 FIX 3: Use the split name fields */}
                <td data-label="Name">{`${firstName} ${surname}`}</td> 
                {/* 🎯 FIX 4: Use 'diagnosis' field (will be NULL/N/A for now) */}
                <td data-label="Diagnosis">{record.diagnosis || 'N/A'}</td> 
                {/* 🎯 FIX 5: Use time_on, time_off, and staff_initials */}
                <td data-label="Time On">{record.time_on || 'N/A'}</td>
                <td data-label="Time Off">{record.time_off || 'N/A'}</td>
                <td data-label="Pre-Weight (kg)">{record.pre_weight}</td>
                <td data-label="Post-Weight (kg)">{record.post_weight}</td>
                {/* 🎯 FIX 6: Use staff_initials for 'Disconnected By' */}
                <td data-label="Disconnected By">{record.staff_initials || 'N/A'}</td> 
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// --- Main Component ---
const HemodialysisChart = () => { // 🎯 FIX: Removed patientId prop
  const { token } = useAuth(); // Assuming you only need the token/auth state
  const [formData, setFormData] = useState(initialFormData);
  const [saveSuccess, setSaveSuccess] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [setSavedRecord] = useState(null);

  // --- STATE FOR PATIENT SELECTION ---
  const [searchId, setSearchId] = useState(''); // Input value for patient ID search
  const [selectedPatientId, setSelectedPatientId] = useState(null); // The ID of the successfully selected patient
  const [selectedPatientData, setSelectedPatientData] = useState(null); // Full data of the selected patient
  // ------------------------------------

  const sigCanvas = useRef({});
  const [allRecords, setAllRecords] = useState([]);
  const [tableLoading, setTableLoading] = useState(false); // Changed default to false, as we rely on search now

 // 🚨 FIX 1: Define the 'config' object using the token
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

// ---------------------------------------------
// 🎯 VERIFY: Function to FETCH Summary Records URL
// ---------------------------------------------
const fetchSummaryRecords = useCallback(async (id) => {
    if (!id) {
      setAllRecords([]);
      setTableLoading(false);
      return;
    }

    setTableLoading(true);
    try {
      // 🎯 CRITICAL FIX: Use the full path matching the new route: 
      // http://localhost:5000/api/hemodialysis/1/records
      const response = await axios.get(`${HEMODIALYSIS_API_URL}/${id}/records`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAllRecords(response.data);
    } catch (error) {
      console.error("Error fetching summary records:", error.response?.data?.error || error.message);
      setAllRecords([]);
    } finally {
      setTableLoading(false);
    }
  }, []);

// ---------------------------------------------
// 🎯 CORRECTED: Function to FETCH Patient Details (Master Record)
// ---------------------------------------------
const fetchPatientDetails = useCallback(async (id) => {
    setLoading(true);
    setApiError(null);
    try {
      const token = localStorage.getItem('token');
      // Route: /api/hemodialysis/patient/:id
      const response = await axios.get(`${HEMODIALYSIS_API_URL}/patient/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const patient = response.data;
      
      if (!patient || Object.keys(patient).length === 0) {
        throw new Error('Patient not found with this ID.');
      }

      // Successfully found a patient!
      setSelectedPatientId(id);
      
      // 🎯 CRITICAL: This stores the full payload (name, age, gender, address, contact_details) for display.
      setSelectedPatientData(patient); 

      // Pre-fill relevant data into the HD form (formData)
      setFormData(prev => ({
        ...prev,
        // Only map fields that pre-fill the form inputs (name and age)
        name: patient.name || '', 
        age: patient.age || '',
        
        // height, access, dialyzer, etc., are left at initialFormData's empty string
      }));

      // Fetch existing HD records for this newly selected patient
      fetchSummaryRecords(id);

    } catch (error) {
      console.error('Error fetching patient details:', error.response?.data?.details || error.message);
      setApiError(`Failed to fetch patient ID ${id}: ${error.response?.data?.details || error.message || 'Not found.'}`);
      setSelectedPatientId(null);
      setSelectedPatientData(null);
      setFormData(initialFormData); // Clear form
    } finally {
      setLoading(false);
    }
}, [fetchSummaryRecords]);

  // Handler for the search button click
  const handleSearch = (e) => {
    e.preventDefault();
    const idToSearch = parseInt(searchId, 10);
    if (isNaN(idToSearch) || idToSearch <= 0) {
      setApiError('Please enter a valid Patient ID (number).');
      return;
    }
    fetchPatientDetails(idToSearch);
  };

  // 🎯 Removed the useEffect that depended on 'patientId' prop.

  const handleSignatureEnd = () => {
    const signatureData = sigCanvas.current.toDataURL();
    setFormData(prev => ({ ...prev, patientSignature: signatureData }));
  };

  const clearSignature = () => {
    sigCanvas.current.clear();
    setFormData(prev => ({ ...prev, patientSignature: null }));
  };


  // 🎯 FIX: Robust generic handler for all non-array fields 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
    setApiError(null);
    setSaveSuccess(null);
  };

  // 🎯 FIX: Robust handler for the dynamic time_intervals array
  const handleTimeIntervalChange = (index, field, value) => {
    setFormData(prevData => {
      const newIntervals = [...prevData.time_intervals];
      newIntervals[index] = {
        ...newIntervals[index],
        [field]: value,
      };
      return {
        ...prevData,
        time_intervals: newIntervals,
      };
    });
    setApiError(null);
    setSaveSuccess(null);
  };

  const addTimeInterval = () => {
    setFormData(prevData => {
      const newIntervals = [...prevData.time_intervals];
      const newIndex = newIntervals.length + 1;
      const newTime = `H${newIndex}`;
      newIntervals.push({ time: newTime, bp: '', ap: '', vp: '' });
      return {
        ...prevData,
        time_intervals: newIntervals,
      };
    });
  };

  const removeTimeInterval = (indexToRemove) => {
    setFormData(prevData => {
      const filteredIntervals = prevData.time_intervals.filter((_, index) => index !== indexToRemove);
      const reIndexedIntervals = filteredIntervals.map((interval, index) => ({
        ...interval,
        time: `H${index + 1}`
      }));

      return {
        ...prevData,
        time_intervals: reIndexedIntervals.length > 0 ? reIndexedIntervals : initialFormData.time_intervals,
      };
    });
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setApiError(null);
    setSaveSuccess('Hemodialysis Chart Cleared!');
    setSavedRecord(null);
    if (sigCanvas.current) sigCanvas.current.clear();
    setTimeout(() => setSaveSuccess(null), 3000);
  };


// ---------------------------------------------
// 🎯 FINAL CORRECTED: The handleSubmit function (Includes Error Toast Fix)
// ---------------------------------------------
const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPatientId) {
      // Use setSaveSuccess(true) to ensure the toast component becomes visible
      setApiError('Please search for and select a Patient ID before saving the record.');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5000); // Clear after 5s
      return;
    }

    setLoading(true);
    setSaveSuccess(false); // Reset success state
    setApiError(null);     // Reset error state

    const currentToken = localStorage.getItem('token'); 
    
    // NOTE: Add token check logic here if it was omitted
    
    const postConfig = { 
        headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json'
        }
    };
    
    const url = `${HEMODIALYSIS_API_URL}/${selectedPatientId}/record`;
    
    const payload = {
      patientId: selectedPatientId,
      
      // Mismatched Fields (Front-end Key -> Back-end Key)
      dialysisDate: formData.preDate, 
      durationHours: formData.treatmentHours,
      dialyzerType: formData.dialyzer,
      bloodFlowRate: formData.bloodPumpSpeedQb,
      dialysateFlowRate: formData.dialysateSpeedQd,
      // staffInitials: formData.disconnectedBy, <--- REMOVED THIS LINE
      
      // NEW FIELDS MAPPING 
      diagnosis: formData.diagnosis,
      timeOn: formData.timeOn,
      timeOff: formData.timeOff,
      
      // Matching/Required Fields
      preWeight: formData.preWeight,
      postWeight: formData.postWeight,
      notes: formData.notes || '', // Ensure notes is included
      // Add signatureData: sigCanvas.current.toDataURL() if needed by the controller
    };


    try {
      // 🎯 CORRECT: Sending POST request
      await axios.post(url, payload, postConfig); 

      // --- HANDLE SUCCESS ---
      setApiError(null);
      setSaveSuccess(true); // Show SUCCESS toast
      
      // Re-fetch the entire record list to update the summary table
      await fetchSummaryRecords(selectedPatientId); 

      // FIX: Clear the form, but preserve patient master data
      setFormData(prev => ({ 
        ...initialFormData,
        name: selectedPatientData.name || '', 
        age: selectedPatientData.age || '',
      }));
      if (sigCanvas.current) sigCanvas.current.clear();

    } catch (error) {
      // --- HANDLE ERROR ---
      const serverMessage = error.response?.data?.message || error.message || 'An unknown error occurred.';
      
      // 🎯 CRITICAL FIX: Set setApiError to show the message, and setSaveSuccess(true) to make the toast visible.
      setApiError(`Save Failed: ${serverMessage}. You may need to restart your server to apply database schema changes.`); 
      setSaveSuccess(true); // Trigger the toast (which displays either success or error)
      
      console.error('Error saving record:', error.response?.data || error.message);

    } finally {
      setLoading(false);
      // This timeout now correctly clears both success and error toasts after 5 seconds
      setTimeout(() => {
          setSaveSuccess(false);
          setApiError(null);
      }, 5000); 
    }
};

  const renderInputField = (label, name, type = 'text', options = []) => (
    <div className="hd-input-group">
      <label htmlFor={name} className="hd-input-label">{label}</label>
      {options.length > 0 ? (
        <select
          id={name}
          name={name}
          className="hd-input-field hd-select-field"
          value={formData[name]}
          onChange={handleChange}
        >
          <option value="" disabled>Select {label}</option>
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          className="hd-input-field"
          value={formData[name]}
          onChange={handleChange}
          placeholder={`Enter ${label}...`}
        />
      )}
    </div>
  );

  return (
    <div className="hd-chart-main-wrapper" style={{ overflowX: 'hidden' }}>
      <h1 className="hd-page-heading">Hemodialysis Records Chart <FaHeartbeat style={{ color: '#e74c3c' }} /></h1>

      {/* ---------------------------------------------------- */}
      {/* --- PATIENT SEARCH BAR (CRITICAL NEW IMPLEMENTATION) --- */}
      {/* ---------------------------------------------------- */}
      <div className="hd-patient-search-bar">
        <p className="hd-sub-title">
          Patient ID: {selectedPatientId || <span style={{ color: 'red' }}> Please search and select a patient.</span>}
        </p>
        <form onSubmit={handleSearch} className="hd-search-form">
          <input
            type="number"
            placeholder="Enter Patient ID"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            required
            min="1"
          />
          <button type="submit" disabled={loading}>
            {loading && !selectedPatientId ? <FaSpinner className="spinner" /> : <><FaSearch /> Search & Load</>}
          </button>
        </form>
         {selectedPatientData && (
          <div className="hd-patient-info-display">
            {/* Display the critical patient details you want visible after search */}
            <p><strong>Patient Name:</strong> {selectedPatientData.name}</p> 
            <p><strong>Gender:</strong> {selectedPatientData.gender}</p> 
            <p><strong>Contact Details:</strong> {selectedPatientData.contact_details}</p>
            <p><strong>Patient Address:</strong> {selectedPatientData.address}</p>    
          </div>
        )}
      </div>

      <div className="hd-form-paper-card">
        <motion.button
          type="button"
          className="global-reset-btn"
          onClick={handleReset}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          disabled={!selectedPatientId}
        >
          <FaRedoAlt /> Reset Form
        </motion.button>

        {/* 🎯 FIX: Form is now disabled until a patient is selected */}
        <form onSubmit={handleSubmit}>
          <fieldset disabled={!selectedPatientId || loading}>
            {/* --- 1. PATIENT AND GENERAL INFORMATION --- */}
            <div className="hd-form-section">
              <h2 className="hd-section-title"><FaUserMd /> Patient Information</h2>
              <div className="hd-grid-layout-3">
                {/* These fields will be pre-filled by the search function */}
                {renderInputField('Patient Name', 'name')}
                {renderInputField('Surname', 'surname')}
                {renderInputField('Diagnosis', 'diagnosis')}
                {renderInputField('Doctor', 'doctor', 'text', staffNames)}
                {renderInputField('Age', 'age', 'number')}
                {renderInputField('Height (cm)', 'height', 'number')}
                {renderInputField('Medical Aid Name', 'medicalAidName')}
                {renderInputField('Medical Aid No.', 'medicalAidNo')}
              </div>
            </div>

            {/* --- 2. DIALYSIS PARAMETERS AND ACCESS --- */}
            <div className="hd-form-section">
              <h2 className="hd-section-title"><FaVial /> Dialysis Parameters & Access</h2>
              <div className="hd-grid-layout-3">
                {renderInputField('Vascular Access', 'access', 'text', accessOptions)}
                {renderInputField('Needle Size', 'needleSize')}
                {renderInputField('Port Length', 'portLength')}
                {renderInputField('Dialyzer', 'dialyzer', 'text', dialyzerOptions)}
                {renderInputField('Dry Weight (kg)', 'dryWeight', 'number')}
                {renderInputField('Dialysate Speed Qd', 'dialysateSpeedQd')}
                {renderInputField('Blood Pump Speed Qb', 'bloodPumpSpeedQb')}
                {renderInputField('Treatment Hours', 'treatmentHours', 'number')}
                {renderInputField('Anticoagulation & Dose', 'anticoagulationAndDose')}
              </div>
            </div>

            {/* --- 3. PRE-DIALYSIS SETUP & VITALS --- */}
            <div className="hd-form-section">
              <h2 className="hd-section-title"><FaSyringe /> Pre-Dialysis Setup & Vitals</h2>
              <div className="hd-grid-layout-3">
                {renderInputField('Pre Date', 'preDate', 'date')}
                {renderInputField('Time On', 'timeOn', 'time')}
                {renderInputField('Primed By', 'primedBy', 'text', staffNames)}
                {renderInputField('Stock Utilised', 'stockUtilised')}
              </div>
              <div className="hd-grid-layout-4 hd-vitals-grid">
                {renderInputField('Pre-Weight (kg)', 'preWeight', 'number')}
                {renderInputField('Pre B.P. (mmHg)', 'preBP')}
                {renderInputField('Pre Pulse (bpm)', 'prePulse', 'number')}
                {renderInputField('Pre Blood Glucose', 'preBloodGlucose')}
                {renderInputField('Pre Temperature (°C)', 'preTemperature')}
                {renderInputField('HGT', 'hgt')}
                {renderInputField('Saturation (%)', 'saturation', 'number')}
                {renderInputField('Post Connection BP', 'postConnectionBP')}
              </div>
            </div>

            {/* --- 4. TIME INTERVAL READINGS (Dynamic Table) --- */}
            <TimeIntervalsTable
              timeIntervals={formData.time_intervals}
              handleTimeIntervalChange={handleTimeIntervalChange}
              addTimeInterval={addTimeInterval}
              removeTimeInterval={removeTimeInterval}
            />

            {/* --- 5. POST-DIALYSIS RESULTS --- */}
            <div className="hd-form-section">
              <h2 className="hd-section-title"><FaCheckCircle /> Post-Dialysis Results</h2>
              <div className="hd-grid-layout-3 hd-vitals-grid">
                {renderInputField('Pre Disconnection BP', 'preDisconnectionBP')}
                {renderInputField('Post Disconnection BP', 'postDisconnectionBP')}
                {renderInputField('Post Weight (kg)', 'postWeight', 'number')}
                {renderInputField('Post Qd', 'postQd')}
                {renderInputField('Post Qb', 'postQb')}
                {renderInputField('Post UF', 'postUf')}
                {renderInputField('Post KTV', 'postKtv')}
                {renderInputField('Time Off', 'timeOff', 'time')}
                {renderInputField('Disconnected By', 'disconnectedBy', 'text', staffNames)}
              </div>
            </div>

            {/* =======================================================
                  YOUR PREFERRED SIGNATURE BLOCK
              ======================================================= */}
            <div className="grid-item-4 signature-section-container">
              <div className="signature-content-wrapper">
                <p className="signature-title"> Patient/Caregiver Signature:</p>
                <div className="signature-pad-card">
                  <SignatureCanvas
                    ref={sigCanvas}
                    penColor='black'
                    canvasProps={{ className: 'sigCanvas' }}
                    onEnd={handleSignatureEnd}
                  />
                </div>
                <button
                  type="button"
                  onClick={clearSignature}
                  className="clear-signature-btn"
                >
                  Clear Signature
                </button>
                {formData.patientSignature && (
                  <p className="signature-status">Signature Captured <FaCheckCircle style={{ color: '#2ecc71', marginLeft: '5px' }} /></p>
                )}
              </div>
            </div>

            {/* --- SUBMIT BUTTON --- */}
            <div className="hd-form-footer-area">
              <div className="hd-divider-main"></div>
              <motion.button
                type="submit"
                className="hd-submit-action-btn"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading || tableLoading}
              >
                {loading ? <FaSpinner className="hd-spinner" /> : 'SAVE HEMODIALYSIS CHART'}
              </motion.button>
            </div>
          </fieldset>
        </form>
      </div>

      {/* Summary Table Rendered after the Form */}
      <div className="hd-summary-section">
        {selectedPatientId ? (
          tableLoading ? (
            <div className="hd-loading-state">
              <FaSpinner className="hd-spinner" />
              <p>Loading Hemodialysis Records...</p>
            </div>
          ) : (
            <HemodialysisSummaryTable records={allRecords} />
          )
        ) : (
          <p className="no-records-message">Search for a Patient ID to view their history.</p>
        )}
      </div>

      {/* Global Toast Notification */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            className={`hd-custom-toast ${apiError ? 'hd-toast-error' : 'hd-toast-success'}`}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {apiError ? <FaRedoAlt className="hd-toast-icon" /> : <FaCheckCircle className="hd-toast-icon" />}
            <span className="hd-toast-message">{apiError ? apiError : 'Record saved successfully!'}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default HemodialysisChart;