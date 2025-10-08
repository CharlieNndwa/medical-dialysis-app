import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChartLine, FaExclamationTriangle } from 'react-icons/fa';
// Import local charting library for fallback
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './PowerBIDiagrams.css'; 

// ⚠️ IMPORTANT: KEEP THIS EMPTY TO USE THE LOCAL CHART FALLBACK.
// Paste your Power BI Embed URL here when ready to switch to Power BI:
const POWER_BI_EMBED_URL = ""; 

// Mock data for the local fallback chart
const mockKtvData = [
    { name: 'S-1', ktv: 1.15 },
    { name: 'S-2', ktv: 1.25 },
    { name: 'S-3', ktv: 1.18 },
    { name: 'S-4', ktv: 1.30 },
    { name: 'S-5', ktv: 1.22 },
    { name: 'S-6', ktv: 1.28 },
];

const PowerBIDiagrams = ({ patientId }) => {

    // Variants for Framer Motion animation
    const containerVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20, duration: 0.5 } },
    };
    
    // --- FALLBACK LOGIC ---
    const usePowerBI = POWER_BI_EMBED_URL.trim() !== "";
    const filterString = patientId ? `&filter=PatientTable/PatientID eq '${patientId}'` : '';
    const srcUrl = `${POWER_BI_EMBED_URL}${filterString}`;

    // --- RENDER LOCAL FALLBACK CHART (If no URL) ---
    const renderLocalChart = () => (
        <motion.div
            key="local-chart"
            className="powerbi-diagrams-container"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="diagram-header local-chart-header">
                <FaChartLine className="header-icon" />
                <h3>Local Trend: Kt/V Over Last 6 Sessions (Patient: {patientId})</h3>
            </div>
            <div className="local-chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={mockKtvData}
                        margin={{ top: 15, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" stroke="#555" />
                        <YAxis 
                            domain={[1.0, 1.4]} 
                            tickCount={5} 
                            stroke="#555" 
                            label={{ value: 'Kt/V Ratio', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip 
                            formatter={(value) => [`Kt/V: ${value.toFixed(2)}`, 'Session']}
                            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #ccc' }}
                        />
                        <Line type="monotone" dataKey="ktv" stroke="#0077b6" strokeWidth={3} dot={{ strokeWidth: 2, r: 4 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );

    // --- RENDER POWER BI IFRAME (If URL is present) ---
    const renderPowerBI = () => (
        <motion.div
            key="report"
            className="powerbi-diagrams-container"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
        >
            <div className="diagram-header">
                <FaChartLine className="header-icon" />
                <h3>Advanced Quality Metrics (Power BI Embedded) for Patient ID: {patientId}</h3>
            </div>
            
            <div className="iframe-wrapper">
                <iframe
                    title={`Power BI Report for Patient ${patientId}`}
                    className="powerbi-iframe"
                    src={srcUrl}
                    frameBorder="0"
                    allowFullScreen={true}
                ></iframe>
            </div>
        </motion.div>
    );

    return (
        <AnimatePresence mode="wait">
             {!patientId ? (
                // Renders "Select a patient..." note
                <motion.div
                    key="note"
                    className="powerbi-note-placeholder"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                >
                    <FaExclamationTriangle className="note-icon" />
                    <h2>Advanced Visuals Awaiting Selection</h2>
                    <p>
                        Please select a patient to automatically filter and load their interactive **Quality Metrics Report**.
                    </p>
                </motion.div>
            ) : (
                // Renders either Power BI (if URL exists) or Local Chart (if URL is empty)
                usePowerBI ? renderPowerBI() : renderLocalChart()
            )}
        </AnimatePresence>
    );
};

export default PowerBIDiagrams;