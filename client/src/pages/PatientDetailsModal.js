import React from 'react';
import { FaTimes, FaPrint } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import PatientRecordView from './PatientRecordView'; 
// Assumes PatientDetails.css and PatientRecordView.css contain the modal/print styles

const PatientDetailsModal = ({ isOpen, onClose, patientData }) => {
    // Return early if the modal is closed or no data is passed
    if (!isOpen || !patientData) return null;

    const handlePrint = () => {
        // Triggers the browser's print dialog, leveraging the @media print CSS in PatientRecordView.css
        window.print();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="modal-overlay">
                    <motion.div
                        className="modal-content"
                        initial={{ opacity: 0, y: "-20%" }}
                        animate={{ opacity: 1, y: "0%" }}
                        exit={{ opacity: 0, y: "-20%" }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Modal Header for title and control buttons */}
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {/* FIX: Ensure ID is displayed here */}
                                Patient Record: {patientData.fullName || 'N/A'} (ID: {patientData.id || patientData.patientId || 'N/A'})
                            </h2>
                            <div className="modal-actions">
                                <motion.button
                                    className="print-button"
                                    onClick={handlePrint}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    aria-label="Print Record"
                                >
                                    <FaPrint /> Print
                                </motion.button>
                                <motion.button
                                    className="close-button"
                                    onClick={onClose}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    aria-label="Close"
                                >
                                    <FaTimes />
                                </motion.button>
                            </div>
                        </div>

                        {/* Read-Only Notice */}
                        <div className="read-only-notice-container">
                             <p className="read-only-notice">
                                **Viewing Patient Master Record (Read-Only)**
                             </p>
                        </div>


                        {/* Content: The actual read-only view */}
                        <PatientRecordView 
                            patientData={patientData} 
                        />
                        
                        <div className="modal-footer">
                             <motion.button
                                className="close-button-footer"
                                onClick={onClose}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                             >
                                CLOSE VIEW
                             </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PatientDetailsModal;