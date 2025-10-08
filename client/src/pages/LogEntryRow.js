import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaEraser, FaTrashAlt } from 'react-icons/fa';
import useSignatureCanvas from './useSignatureCanvas'; // Import the custom hook

const actionOptions = [
    'Admission Assessment', 'Daily Progress Note', 'Intervention Performed',
    'Patient Education Given', 'Condition Change Noted', 'Discharge Planning',
    'Referral Made', 'Medication Administered', 'Lab Results Reviewed',
    'Family Counseling', 'Other Action'
];
const staffQualifications = ['RN', 'MD', 'LPN', 'NP', 'PA', 'CNA', 'BSc Nursing'];


const LogEntryRow = ({ entry, index, totalRows, onUpdate, onRemove }) => {
    // 🎯 FIX: CALL THE HOOK AT THE TOP LEVEL OF THE COMPONENT
    const { canvasRef, clearSignature,isEmpty, currentSignature } = useSignatureCanvas(entry.signatureImage);

    // Effect to push signature data to the parent component state after the canvas updates
    useEffect(() => {
        if (currentSignature !== entry.signatureImage) {
            onUpdate(index, 'signatureImage', currentSignature);
        }
    }, [currentSignature, index, onUpdate, entry.signatureImage]);


    // Handles changes for individual input fields
    const handleEntryChange = (field, value) => {
        onUpdate(index, field, value);
    };

    // Handles the signature clear button click
    const handleClearSignature = () => {
        clearSignature();
        onUpdate(index, 'signatureImage', ''); // Also clear the data in the parent state
    };


    // inside the hook, which then updates 'currentSignature', triggering the useEffect above.
    
    // We pass the final signature data back to the parent component on submit via the 'entry' object
    // which is updated by the useEffect above.

    return (
        <div className="cpl-data-row" key={entry.id}>
            {/* Date, Time, Action Column */}
            <div className="cpl-data-cell cpl-date-time-action-cell">
                <div className="cpl-datetime-display">{entry.dateTime}</div>
                <select
                    value={entry.action}
                    onChange={(e) => handleEntryChange('action', e.target.value)}
                    className="cpl-action-dropdown"
                >
                    <option value="" disabled>Select Action</option>
                    {actionOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            </div>

            {/* Problems Identified / Progress / Recommendation / Education Given Column */}
            <div className="cpl-data-cell cpl-problems-cell">
                <textarea
                    value={entry.notes}
                    onChange={(e) => handleEntryChange('notes', e.target.value)}
                    rows="4" 
                    placeholder="Enter problems identified, progress made, recommendations, or education given..."
                    className="cpl-notes-textarea"
                ></textarea>
            </div>

            {/* Signature Column with Canvas */}
            <div className="cpl-data-cell cpl-signature-canvas-cell">
                <canvas
                    ref={canvasRef}
                    className="cpl-signature-canvas"
                    // The hook handles updating its internal state on draw end
                    // We only need to ensure the canvas ref is correctly assigned.
                ></canvas>
                <input
                    type="text"
                    value={entry.signatureText}
                    onChange={(e) => handleEntryChange('signatureText', e.target.value)}
                    placeholder="Staff Name (Optional)"
                    className="cpl-signature-text-input"
                />
                <motion.button
                    type="button"
                    className="cpl-clear-signature-btn"
                    onClick={handleClearSignature}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isEmpty}
                >
                    <FaEraser /> Clear
                </motion.button>
            </div>

            {/* Qualification Column */}
            <div className="cpl-data-cell cpl-qualification-cell">
                <select
                    value={entry.qualification}
                    onChange={(e) => handleEntryChange('qualification', e.target.value)}
                    className="cpl-qualification-dropdown"
                >
                    <option value="" disabled>Select Qual.</option>
                    {staffQualifications.map(qual => (
                        <option key={qual} value={qual}>{qual}</option>
                    ))}
                </select>
            </div>

            {/* Action Column for row removal */}
            <div className="cpl-data-cell cpl-row-actions-cell">
                {totalRows > 1 && ( 
                    <motion.button
                        type="button"
                        className="cpl-remove-row-btn"
                        onClick={() => onRemove(index)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <FaTrashAlt />
                    </motion.button>
                )}
            </div>
        </div>
    );
};

export default LogEntryRow;