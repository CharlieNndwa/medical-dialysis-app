import React from 'react';
import { FaPrint, FaDownload, FaTimes } from 'react-icons/fa';

// Helper function to format file size for display in the modal footer
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FilePreviewModal = ({ file, onClose }) => {
    // Return null if no file is selected (i.e., the modal is closed)
    if (!file) return null;

    const handleDownload = () => {
        // file.fileUrl is the temporary URL created by URL.createObjectURL()
        if (file.fileUrl) {
            const a = document.createElement('a');
            a.href = file.fileUrl;
            a.download = file.name; // Use the original file name for download
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    const handlePrint = () => {
        const previewFrame = document.getElementById('file-preview-iframe');
        if (previewFrame) {
            // Target the content of the iframe for printing
            previewFrame.contentWindow.focus();
            previewFrame.contentWindow.print();
        } else {
            // Fallback
            window.print();
        }
    };

    const fileType = file.name.split('.').pop().toLowerCase();
    let previewContent;

    // Use an iframe to safely and effectively display PDFs, images, and other common formats.
    if (['pdf', 'txt', 'html', 'htm', 'jpg', 'jpeg', 'png', 'gif'].includes(fileType)) {
        previewContent = (
            <iframe
                id="file-preview-iframe"
                src={file.fileUrl}
                title="File Preview"
                className="file-preview-iframe"
                frameBorder="0"
            />
        );
    } else {
        // Display a message for unsupported file types
        previewContent = (
            <div className="file-preview-unsupported">
                <p>Preview not available for **.{fileType}** files.</p>
                <p>Please use the download button to view the file.</p>
            </div>
        );
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{file.name}</h2>
                    {/* Close button with FaTimes icon */}
                    <button className="close-btn" onClick={onClose}><FaTimes /></button>
                </div>
                <div className="modal-body">
                    {previewContent}
                </div>
                <div className="modal-footer">
                    <span className="file-info-text">
                        Type: **{fileType.toUpperCase()}** | Size: **{formatFileSize(file.size)}**
                    </span>
                    <div className="modal-actions">
                        {/* Print Button */}
                        <button 
                            className="modal-action-btn print-btn" 
                            onClick={handlePrint}
                        >
                            <FaPrint style={{ marginRight: '8px' }} />
                            Print Document
                        </button>
                        {/* Download Button */}
                        <button 
                            className="modal-action-btn download-btn" 
                            onClick={handleDownload}
                        >
                            <FaDownload style={{ marginRight: '8px' }} />
                            Download File
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilePreviewModal;