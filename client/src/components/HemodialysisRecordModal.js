import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimesCircle, FaFileAlt } from 'react-icons/fa';
import './HemodialysisRecordModal.css'; // You'll create this CSS file next

const HemodialysisRecordModal = ({ record, isOpen, onClose }) => {
    if (!record) return null;

    // Helper to format date and time for display
    const formatValue = (key, value) => {
        if (!value) return 'N/A';
        if (key.includes('date')) {
            return new Date(value).toLocaleDateString();
        }
        return value;
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    className="hd-modal-overlay" 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose} // Close on overlay click
                >
                    <motion.div 
                        className="hd-modal-content"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the modal
                    >
                        <button className="hd-modal-close-btn" onClick={onClose}>
                            <FaTimesCircle />
                        </button>
                        
                        <h2 className="hd-modal-title">
                            <FaFileAlt className="hd-modal-icon" /> 
                            Record Details for Session: {formatValue('session_date', record.session_date)}
                        </h2>
                        
                        {/* --- Display key fields as read-only for visualization --- */}
                        <div className="hd-modal-details-grid">
                            <div className="hd-modal-detail-item">
                                <label>Date of Session:</label>
                                <span>{formatValue('session_date', record.session_date)}</span>
                            </div>
                            <div className="hd-modal-detail-item">
                                <label>Duration (Hours):</label>
                                <span>{formatValue('', record.duration_hours)}</span>
                            </div>
                            <div className="hd-modal-detail-item">
                                <label>Pre-Weight (kg):</label>
                                <span>{formatValue('', record.pre_weight)}</span>
                            </div>
                            <div className="hd-modal-detail-item">
                                <label>Post-Weight (kg):</label>
                                <span>{formatValue('', record.post_weight)}</span>
                            </div>
                            <div className="hd-modal-detail-item">
                                <label>Dialyzer Type:</label>
                                <span>{formatValue('', record.dialyzer_type)}</span>
                            </div>
                            <div className="hd-modal-detail-item">
                                <label>Blood Flow Rate (Qb):</label>
                                <span>{formatValue('', record.blood_flow_rate)}</span>
                            </div>
                            <div className="hd-modal-detail-item">
                                <label>Dialysate Flow Rate (Qd):</label>
                                <span>{formatValue('', record.dialysate_flow_rate)}</span>
                            </div>
                             <div className="hd-modal-detail-item full-row">
                                <label>Diagnosis:</label>
                                <span>{formatValue('', record.diagnosis)}</span>
                            </div>
                            <div className="hd-modal-detail-item full-row">
                                <label>Session Notes:</label>
                                <p className="hd-modal-notes">{record.notes || 'No notes captured.'}</p>
                            </div>

                            {/* This is where the signature would go if you saved the actual image data */}
                            {record.signature_data && (
                                <div className="hd-modal-detail-item full-row signature-section">
                                    <label>Signature:</label>
                                    <img src={record.signature_data} alt="Captured Signature" className="hd-modal-signature" />
                                </div>
                            )}
                        </div>

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default HemodialysisRecordModal;