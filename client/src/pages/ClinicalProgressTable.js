// FILE: ClinicalProgressTable.js

import React from 'react';

// This component receives the logEntries array and displays it.
const ClinicalProgressTable = ({ records }) => {
    if (!records || records.length === 0) {
        return (
            <div className="cpl-no-records-message">
                No progress log entries to display yet.
            </div>
        );
    }

    // Define the columns based on the log entry structure
    const columns = [
        { header: 'Time/Date', field: 'dateTime' },
        { header: 'Action/Intervention', field: 'action' },
        { header: 'Notes/Observations', field: 'notes' },
        { header: 'Staff Signature', field: 'signatureText' },
        { header: 'Qualification', field: 'qualification' }
    ];

    return (
        <div className="cpl-table-wrapper">
            <h3 className="cpl-table-title">Recent Clinical Progress Entries</h3>
            <div className="cpl-summary-table-container">
                <table className="cpl-summary-table">
                    <thead>
                        <tr>
                            {columns.map(col => (
                                <th key={col.header}>{col.header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {records.map((entry, index) => (
                            // The entry.id from the state should be used as the key
                            <tr key={entry.id || index}> 
                                {columns.map(col => (
                                    <td key={col.field}>
                                        {/* Display 'N/A' or a placeholder if a field is empty */}
                                        {entry[col.field] || '-'}
                                        
                                        {/* Special handling for signatureImage (optional, can be skipped for simplicity) */}
                                        {col.field === 'signatureText' && entry.signatureImage && (
                                            <span className="cpl-signature-indicator"> (Signed)</span>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ClinicalProgressTable;