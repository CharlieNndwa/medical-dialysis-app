import React from 'react';
import { FaFileAlt, FaDownload, FaClock } from 'react-icons/fa';
import './PatientDetails.css'; // Assuming you'll reuse the grid/styling
import './PatientRecordView.css';

// Helper function to safely render date or 'N/A'
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        // Attempt to parse and format the date as YYYY-MM-DD
        const date = new Date(dateString);
        if (isNaN(date)) return dateString; // Return original if parsing fails
        // Use toISOString().split('T')[0] to ensure it's in yyyy-mm-dd format
        return date.toISOString().split('T')[0];
    } catch (e) {
        return dateString; // Return original on error
    }
};

// Helper component for displaying a single data field
const DataField = ({ label, value }) => (
    <div className="data-field">
        <label>{label}</label>
        <p className="data-value">{value || 'N/A'}</p>
    </div>
);

// Helper function to render attachment link/info (Assuming file names are passed in the attachments array)
const AttachedFilesDisplay = ({ files, patientId }) => {
    if (!files || files.length === 0) {
        return <p className="file-name" style={{ fontStyle: 'italic', opacity: 0.7 }}>No documents attached.</p>;
    }

    // NOTE: In the current frontend logic, attachedFiles is an array of File objects 
    // when SAVING. The GET response from the backend will likely have an array of file names.
    // For now, we will display what is passed.
    return (
        <div className="attached-files-container view-mode">
            {files.map((file, index) => (
                <div key={index} className="attached-file-block">
                    <FaFileAlt className="file-icon" />
                    <span className="file-name">{typeof file === 'string' ? file : file.name || 'Document'}</span>
                    <button
                        className="file-action-btn download-btn"
                        onClick={() => console.log(`Download action for file: ${file.name || file}`)}
                    >
                        <FaDownload /> Download
                    </button>
                </div>
            ))}
        </div>
    );
};

// --- Main Patient Record View Component ---
const PatientRecordView = ({ patientData }) => {
    if (!patientData) return <p>Loading patient data...</p>;

    const {
        // --- Personal Details (Age should now be correct from BE data)
        patient_id: id, // DB: patient_id -> FE: id (used for attachments)
        full_name: fullName,
        date_of_birth: dateOfBirth,
        contact_details: contactDetails,
        address, // DB: address -> FE: address (direct match)
        next_of_kin: nextOfKin, // DB: next_of_kin -> FE: nextOfKin
        age, // DB: age -> FE: age (direct match)
        gender, // DB: gender -> FE: gender (direct match)
        height, // DB: height -> FE: height (direct match)
        weight, // DB: weight -> FE: weight (direct match)
        
        // --- Medical Status (Assume converted to camelCase in BE but included for safety)
        access_type: accessType,
        diabeticStatus, // Converted/aliased in BE fix
        smokingStatus,  // Converted/aliased in BE fix
        
        // --- Dialysis Prescription
        dialysis_modality: dialysisModality, // DB: dialysis_modality -> FE: dialysisModality
        frequency,
        script_duration: prescribedDose, // DB: script_duration -> FE: prescribedDose
        dialyser,
        buffer,
        qd,
        qb,
        anticoagulant,
        
        // --- Script Validity (Aliased to camelCase in the BE query)
        scriptValidityStart, // DB: script_validity_start AS "scriptValidityStart"
        scriptExpiryDate,    // DB: script_validity_end AS "scriptExpiryDate"
        scriptReminder,      // DB: script_reminder AS "scriptReminder"

        attachments,
    } = patientData;
    

  
    
 

    return (
        <div className="patient-record-view-content">
            <div className="form-grid-layout view-mode-grid">
                
                {/* ========================================= */}
                {/* SECTION 1: Patient Demographics */}
                {/* ========================================= */}
                 <div className="grid-item-12 section-header">Patient Demographics (ID: {id || 'N/A'})</div> 

                <div className="grid-item-6"><DataField label="Full Name" value={fullName} /></div>
                <div className="grid-item-6"><DataField label="Address" value={address} /></div>

                <div className="grid-item-3"><DataField label="Contact Details" value={contactDetails} /></div>
                <div className="grid-item-3"><DataField label="Next of Kin Contact" value={nextOfKin} /></div>
                <div className="grid-item-2"><DataField label="Age" value={age} /></div>
                <div className="grid-item-2"><DataField label="Gender" value={gender} /></div>
                <div className="grid-item-2"><DataField label="Height (cm)" value={height} /></div>
                <div className="grid-item-2"><DataField label="Weight (kg)" value={weight} /></div>
                <div className="grid-item-4"><DataField label="Date of Birth" value={formatDate(dateOfBirth)} /></div>

                {/* ========================================= */}
                {/* SECTION 2: Clinical Status */}
                {/* ========================================= */}
                <div className="grid-item-12 section-header mt-30">Clinical Status & Health Profile</div>

                <div className="grid-item-4"><DataField label="Vascular Access Type" value={accessType} /></div>
                <div className="grid-item-4"><DataField label="Diabetic Status" value={diabeticStatus === 'Y' ? 'Yes' : 'No'} /></div>
                <div className="grid-item-4"><DataField label="Smoking Status" value={smokingStatus === 'Y' ? 'Yes' : (smokingStatus === 'F' ? 'Former' : 'No')} /></div>

                {/* ========================================= */}
                {/* SECTION 3: Dialysis Prescription */}
                {/* ========================================= */}
                <div className="grid-item-12 section-header mt-30">Dialysis Prescription Details</div>

                <div className="grid-item-4"><DataField label="Dialysis Modality" value={dialysisModality} /></div>
                <div className="grid-item-2"><DataField label="Frequency (per week)" value={frequency} /></div>
                {/* 🎯 Using the correctly mapped prescribedDose */}
                <div className="grid-item-2"><DataField label="Duration (Hours)" value={prescribedDose} /></div> 
                <div className="grid-item-4"><DataField label="Dialyser" value={dialyser} /></div>

                <div className="grid-item-3"><DataField label="Buffer" value={buffer} /></div>
                <div className="grid-item-3"><DataField label="Qd (mL/min)" value={qd} /></div>
                <div className="grid-item-3"><DataField label="Qb (mL/min)" value={qb} /></div>
                <div className="grid-item-3"><DataField label="Anticoagulant" value={anticoagulant} /></div>

                {/* ========================================= */}
                {/* SECTION 4: Script Validity */}
                {/* ========================================= */}
                <div className="grid-item-12 section-header mt-30">Script Validity & Reminder</div>

                <div className="grid-item-3"><DataField label="Validity Start Date" value={formatDate(scriptValidityStart)} /></div>
                <div className="grid-item-3"><DataField label="Validity End Date" value={formatDate(scriptExpiryDate)} /></div>
                <div className="grid-item-3">
                    <DataField label="Expiry Reminder" value={scriptReminder} />
                </div>
                <div className="grid-item-3">
                    <div className="custom-alert reminder-alert-style">
                        <span className="alert-icon"><FaClock /></span>
                        <p>Alert set: **{scriptReminder || 'N/A'}** before expiry.</p>
                    </div>
                </div>


                {/* ATTACHMENTS */}
                <div className="grid-item-12 attachment-section">
                    <label className="input-label-styled">Attachments / Documents</label>
                    <AttachedFilesDisplay files={attachments} patientId={id} />
                </div>
            </div>
        </div>
    );
};

export default PatientRecordView;