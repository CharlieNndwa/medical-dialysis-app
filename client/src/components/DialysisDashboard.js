import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
     FaCalendarWeek, FaChartPie, FaWeight, FaTint, FaUserMd, FaChartLine 
} from 'react-icons/fa';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import './Dashboard.css';

// 1. IMPORT THE NEW COMPONENT
import PowerBIDiagrams from './PowerBIDiagrams'; 

// --- MOCK DATA & API Placeholder ---

// The client requires Chronic and Acute sessions, drill-down by time.
const mockDashboardData = {
    Chronic: {
        Week: 150, Month: 600, Quarter: 1800, Year: 7200,
    },
    Acute: {
        Week: 25, Month: 100, Quarter: 300, Year: 1200,
    },
    // Mock data for quality metrics 
    qualityMetrics: {
        ktvTrend: 'Adequate (1.35)',
        urrPerformance: 'Good (72%)',
        weightAnalysis: 'Stable (Pre: 75kg, Post: 72kg)',
    }
};

const timeFrames = ['Week', 'Month', 'Quarter', 'Year'];

// Component for the Sessions Summary Chart 
const SessionsSummary = ({ timeFrame }) => {
    const chronic = mockDashboardData.Chronic[timeFrame];
    const acute = mockDashboardData.Acute[timeFrame];
    const total = chronic + acute;
  
    const data = [
      { name: 'Chronic', sessions: chronic, fill: '#0077b6' },
      { name: 'Acute', sessions: acute, fill: '#ff6b6b' },
    ];
  
    return (
      <div className="sessions-summary-card">
        <h3 className="card-subtitle">Total Dialysis Sessions: {total} ({timeFrame})</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 15, right: 0, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#555" />
            <YAxis stroke="#555" />
            <Tooltip 
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #ccc' }}
            />
            <Bar dataKey="sessions" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
};

// Component for Quality Metric Cards
const QualityMetricCard = ({ title, icon: Icon, description, value }) => (
    <div className="metric-item-card">
        <div className="metric-title">
            <Icon className="metric-icon" />
            {title}
        </div>
        <p className="metric-value">{value}</p>
        <p className="metric-description">{description}</p>
    </div>
);

const DialysisDashboard = () => {
    // 2. Mock selectedPatientId to show the chart immediately.
    const [selectedPatientId] = useState('P-1001'); 
    const [currentTimeFrame, setCurrentTimeFrame] = useState('Month'); 

    const handleTimeFrameChange = (timeFrame) => {
        setCurrentTimeFrame(timeFrame);
    };

    return (
        <div className="dashboard-container">
            <h1 className="page-title">Overall KPI</h1>
            
            {/* --- Patient Selector Placeholder --- */}
            {/* <motion.div 
                className="dashboard-card patient-selector-card"
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }}
            >
                <h2 className="card-title">Patient Overview (ID: {selectedPatientId})</h2>
                <div className="patient-details-row">
                    <p>Name: **Jane Doe**</p>
                    <p>Status: **Active**</p>
                    <p>Last Session: **2025-09-28**</p>
                </div>
            </motion.div> */}

            {/* --- Sessions Summary Section --- */}
            <motion.div 
                className="dashboard-card"
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.2 }}
            >
                <h2 className="card-title">Session Frequency Analysis</h2>
                <div className="sessions-summary-tabs">
                    {timeFrames.map(frame => (
                        <button
                            key={frame}
                            className={`tab-button ${currentTimeFrame === frame ? 'active' : ''}`}
                            onClick={() => handleTimeFrameChange(frame)}
                        >
                            {frame}
                        </button>
                    ))}
                </div>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentTimeFrame}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <SessionsSummary timeFrame={currentTimeFrame} />
                    </motion.div>
                </AnimatePresence>
            </motion.div>
            
            {/* --- Quality Metrics Section --- */}
            <motion.div 
                className="dashboard-card" 
                initial={{ opacity: 0, y: 50 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.4 }}
            >
                <h2 className="card-title">Key Quality Metrics</h2>

                {/* Metric Cards Grid */}
                <div className="metrics-grid">
                    <QualityMetricCard 
                        title="Kt/V Efficacy Trend" 
                        icon={FaChartLine}
                        description="Kt/V (Adequacy of Dialysis) trend over the last 6 months. Target: > 1.2"
                        value={mockDashboardData.qualityMetrics.ktvTrend}
                    />
                    <QualityMetricCard 
                        title="URR Performance" 
                        icon={FaChartPie}
                        description="Urea Reduction Ratio (URR) visualized as a recent average. Target: > 65%"
                        value={mockDashboardData.qualityMetrics.urrPerformance}
                    />
                    <QualityMetricCard 
                        title="Weight Analysis" 
                        icon={FaWeight}
                        description="Intra-Dialytic Weight Gain metric from the Report tab."
                        value={mockDashboardData.qualityMetrics.weightAnalysis}
                    />
                </div>
                
                {/* 3. NEW: INSERT PowerBIDiagrams COMPONENT HERE */}
                <div className="powerbi-integration-section">
                    <PowerBIDiagrams patientId={selectedPatientId} />
                </div>
                {/* NOTE: The old Power BI note has been successfully removed/replaced. */}
            </motion.div>

            {/* Placeholder for other high-level metrics (e.g., last script date) */}
            <div className="metrics-grid">
                <QualityMetricCard 
                    title="Last Pathology Test" 
                    icon={FaTint}
                    description="Date of the most recent pathology record."
                    value="2025-09-25 (HB)"
                />
                 <QualityMetricCard 
                    title="Next Management Follow-up" 
                    icon={FaUserMd}
                    description="Next task from Patient Management notes."
                    value="Referral to Cardiology"
                />
                 <QualityMetricCard 
                    title="Script Validity" 
                    icon={FaCalendarWeek}
                    description="Script reminder status from Patient Details."
                    value="Expires 2026-03-01"
                />
            </div>
        </div>
    );
};

export default DialysisDashboard;