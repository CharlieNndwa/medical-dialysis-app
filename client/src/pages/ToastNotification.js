// FILE: ToastNotification.js (FINAL CORRECTED VERSION)

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
// Import a CSS file that contains the .custom-toast styles. Assuming PatientDetails.css for consistency.
import './PatientDetails.css'; 

// Map severity types to corresponding Font Awesome icons
const icons = {
    success: <FaCheckCircle />,
    error: <FaTimesCircle />,
    warning: <FaExclamationTriangle />,
    info: <FaInfoCircle />,
};

const ToastNotification = ({ open, message, severity, onClose }) => {
    // Automatically close the toast after 5 seconds
    useEffect(() => {
        if (open) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000); 

            return () => clearTimeout(timer);
        }
    }, [open, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    // Uses 'custom-toast' and severity for CSS class
                    className={`custom-toast custom-toast-${severity}`} 
                    // Framer Motion Animation for slide-in/slide-out (from right)
                    initial={{ x: 300, opacity: 0 }} 
                    animate={{ x: 0, opacity: 1 }} 
                    exit={{ x: 300, opacity: 0 }} 
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                    <div className="toast-icon">
                        {icons[severity] || icons.info}
                    </div>
                    <div className="toast-message">
                        {message}
                    </div>
                    <button className="toast-close-btn" onClick={onClose}>
                        &times;
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ToastNotification;