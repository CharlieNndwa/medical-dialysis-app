import React, { useState, useRef } from 'react';
import { FaHeartbeat, FaCheckCircle, FaPlus, FaRedoAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import SignatureCanvas from 'react-signature-canvas';
import './DialysisChart.css'; 

// Mock data for dropdowns
const treatmentOptions = ['HDF', 'HD', 'Iron'];
const machineTypes = ['HD', 'HDF'];
const names = ['Dr. Smith', 'Nurse Jane', 'Nurse David', 'Tech Leo'];
const consumables = ['Saline', 'Needle', 'Transducer', 'Heparin'];
const timeIntervalsHeader = ['Time', 'BP', 'Pulse', 'AP', 'VP'];


const initialFormData = {
    // Treatment Plan
    planType: '', planDate: '',

    // Pre-Dialysis
    preDate: '', preTime: '', preHB: '', preBP: '', prePulse: '', preGlucose: '',
    preWeight: '', preTemp: '', micturition: 'No', ufSet: '', machineType: '',
    machineReadings: '', primedBy: '',

    // Intra-Dialysis
    connectedBy: '', intraTime: '', consumable: '', additionalConsumable: '',
    qb: '', qd: '', tmp: '', ufRate: '', clotting: 'N', anticoagulant: '',

    // Post Dialysis
    postBP: '', postPulse: '', postTemp: '', postWeight: '', postUFAchieved: '',
    postKTV: '', postTime: '', disconnectedBy: '',

    // Notes & Signature
    notes: '', patientSignature: null,

    // Dynamic fields for every 30 minutes
    time_intervals: [
        { time: '0:00', bp: '', pulse: '', ap: '', vp: '' },
    ],
};

const DialysisChartPage = () => {
    const [formData, setFormData] = useState(initialFormData);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const sigCanvas = useRef({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleIntervalChange = (index, name, value) => {
        const newIntervals = [...formData.time_intervals];
        newIntervals[index][name] = value;
        setFormData({ ...formData, time_intervals: newIntervals });
    };

    const addInterval = () => {
        const lastTime = formData.time_intervals[formData.time_intervals.length - 1].time;
        const [h, m] = lastTime.split(':').map(Number);

        let newH = h;
        let newM = m + 30;

        if (newM >= 60) {
            newH += 1;
            newM -= 60;
        }

        const newTime = `${newH}:${newM === 0 ? '00' : '30'}`;

        setFormData({
            ...formData,
            time_intervals: [...formData.time_intervals, { time: newTime, bp: '', pulse: '', ap: '', vp: '' }],
        });
    };

    const handleSignatureEnd = () => {
        setFormData({
            ...formData,
            patientSignature: sigCanvas.current.toDataURL(),
        });
    };

    const clearSignature = () => {
        sigCanvas.current.clear();
        setFormData({ ...formData, patientSignature: null });
    };

    const handleReset = () => {
        // Clear all form data
        setFormData(initialFormData);
        // Clear the signature canvas as well
        if (sigCanvas.current && sigCanvas.current.clear) {
            sigCanvas.current.clear();
            setFormData(prev => ({ ...prev, patientSignature: null }));
        }
        
        // Show success/reset toast
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000); 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // --- Data structure for submission (keeping mock for now) ---
        const patientId = '60c72b2f9c1d440000a6c76e'; // Mock ID

        const chartData = {
            patient: patientId, 
            
            plan: {
                planType: formData.planType,
                planDate: formData.planDate,
            },
            
            preDialysisVitals: {
                date: formData.preDate,
                time: formData.preTime,
                hb: formData.preHB,
                bp: formData.preBP,
                pulse: formData.prePulse,
                glucose: formData.preGlucose,
                weight: formData.preWeight,
                temp: formData.preTemp,
                micturition: formData.micturition,
                ufSet: formData.ufSet,
                machineType: formData.machineType,
                machineReadings: formData.machineReadings,
                primedBy: formData.primedBy,
            },
            
            intraDialysisData: {
                connectedBy: formData.connectedBy,
                timeOn: formData.intraTime,
                consumable: formData.consumable,
                additionalConsumable: formData.additionalConsumable,
                vitals: formData.time_intervals, 
                qb: formData.qb,
                qd: formData.qd,
                tmp: formData.tmp,
                ufRate: formData.ufRate,
                clotting: formData.clotting,
                anticoagulant: formData.anticoagulant,
            },
            
            postDialysisVitals: {
                bp: formData.postBP,
                pulse: formData.postPulse,
                temp: formData.postTemp,
                weight: formData.postWeight,
                ufAchieved: formData.postUFAchieved,
                ktv: formData.postKTV,
                timeOff: formData.postTime,
                disconnectedBy: formData.disconnectedBy,
            },
            
            notes: formData.notes,
            patientSignature: formData.patientSignature,
        };
        // --- End Data structure ---

        const token = localStorage.getItem('jwt'); 
        // Using saved port 5000 for API
        const API_URL = 'http://localhost:5000/api/dialysis/save'; 

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, 
                },
                body: JSON.stringify(chartData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Server error response:', errorData);
                throw new Error(errorData.message || 'Failed to save dialysis chart due to a server error.');
            }

            console.log('Dialysis Chart Submitted Successfully:', chartData);
            
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);

        } catch (error) {
            console.error('Submission Error:', error.message);
            alert(`Failed to save chart: ${error.message}. Please check console for details.`);
        }
    };

    // --- Helper Components using new CSS class structure ---

    const FormInput = ({ label, name, type = 'text', value, onChange, placeholder = '', multiline = false, rows = 1 }) => (
        <div className="input-group">
            <label htmlFor={name}>{label}</label>
            {multiline ? (
                <textarea
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    rows={rows}
                    placeholder={placeholder}
                />
            ) : (
                <input
                    id={name}
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    {...(type === 'date' && { placeholder: 'YYYY-MM-DD' })}
                />
            )}
        </div>
    );

    const FormSelect = ({ label, name, value, onChange, options, placeholder = 'Select an option' }) => (
        <div className="input-group">
            <label htmlFor={name}>{label}</label>
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
            >
                <option value="" disabled hidden>{placeholder}</option>
                {options.map(option => (
                    <option key={option} value={option}>{option}</option>
                ))}
            </select>
        </div>
    );
    
    const SectionHeader = ({ title }) => (
        <div className="grid-item-12 section-header">
            <h2 className="section-heading">{title}</h2>
        </div>
    );

    const renderIntervalFields = () => (
        <div className="grid-item-12 intra-intervals-section">
            <h3 className="interval-title">Blood Pressure & Vitals (30-Minute Intervals) <FaHeartbeat /></h3>
            
            <div className="interval-table-card">
                <div className="interval-table-header">
                    {timeIntervalsHeader.map((header, index) => (
                        <div key={index} className={`header-item header-item-${index}`}>{header}</div>
                    ))}
                </div>
                
                <div className="interval-table-body">
                    {formData.time_intervals.map((interval, index) => (
                        <div className="interval-row" key={index}>
                            <div className="row-item row-item-0">
                                <input type="text" disabled value={interval.time} className="interval-time-input" />
                            </div>
                            <div className="row-item row-item-1">
                                <input type="text" placeholder="BP" value={interval.bp} onChange={(e) => handleIntervalChange(index, 'bp', e.target.value)} />
                            </div>
                            <div className="row-item row-item-2">
                                <input type="text" placeholder="Pulse" value={interval.pulse} onChange={(e) => handleIntervalChange(index, 'pulse', e.target.value)} />
                            </div>
                            <div className="row-item row-item-3">
                                <input type="number" placeholder="AP" value={interval.ap} onChange={(e) => handleIntervalChange(index, 'ap', e.target.value)} />
                            </div>
                            <div className="row-item row-item-4">
                                <input type="number" placeholder="VP" value={interval.vp} onChange={(e) => handleIntervalChange(index, 'vp', e.target.value)} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="interval-actions">
                <motion.button 
                    type="button" 
                    className="add-interval-button" 
                    onClick={addInterval}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <FaPlus style={{ marginRight: '5px' }} />
                    Add 30 Min Interval
                </motion.button>
            </div>
        </div>
    );

    // Using the patient-form-container and patient-form-paper classes for consistency
    return (
        <div className="patient-form-container"> 
            <h1 className="page-title">
                Dialysis Treatment Chart
            </h1>

            <div className="patient-form-paper"> 
                 <motion.button 
                    type="button" 
                    className="global-reset-btn"
                    onClick={handleReset}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <FaRedoAlt style={{ marginRight: '8px' }} />
                    Reset Chart
                </motion.button>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-grid-layout">

                        {/* =======================================================
                            TREATMENT PLAN
                        ======================================================= */}
                        <SectionHeader title="Treatment Plan" />

                        <div className="grid-item-4">
                            <FormSelect 
                                label="Treatment Type" 
                                name="planType"
                                value={formData.planType}
                                onChange={handleChange}
                                options={treatmentOptions}
                                placeholder="Select Treatment"
                            />
                        </div>
                        <div className="grid-item-4">
                            <FormInput
                                label="Plan Date"
                                name="planDate"
                                type="date"
                                value={formData.planDate}
                                onChange={handleChange}
                            />
                        </div>
                        
                        <div className="grid-item-12 form-divider"></div>


                        {/* =======================================================
                            PRE-DIALYSIS
                        ======================================================= */}
                        <SectionHeader title="Pre-Dialysis Vitals" />

                        <div className="grid-item-3"><FormInput label="Date" name="preDate" type="date" value={formData.preDate} onChange={handleChange} /></div>
                        <div className="grid-item-3"><FormInput label="Time" name="preTime" type="time" value={formData.preTime} onChange={handleChange} /></div>
                        <div className="grid-item-3"><FormInput label="HB (g/dL)" name="preHB" type="number" value={formData.preHB} onChange={handleChange} /></div>
                        <div className="grid-item-3"><FormInput label="BP (mmHg)" name="preBP" value={formData.preBP} onChange={handleChange} /></div>
                        
                        <div className="grid-item-3"><FormInput label="Pulse" name="prePulse" type="number" value={formData.prePulse} onChange={handleChange} /></div>
                        <div className="grid-item-3"><FormInput label="Glucose" name="preGlucose" type="number" value={formData.preGlucose} onChange={handleChange} /></div>
                        <div className="grid-item-3"><FormInput label="Weight (kg)" name="preWeight" type="number" value={formData.preWeight} onChange={handleChange} /></div>
                        <div className="grid-item-3"><FormInput label="Temp (°C)" name="preTemp" type="number" value={formData.preTemp} onChange={handleChange} /></div>
                        
                        <div className="grid-item-3">
                            <FormSelect 
                                label="Micturition" 
                                name="micturition" 
                                value={formData.micturition} 
                                onChange={handleChange} 
                                options={['Yes', 'No']}
                            />
                        </div>
                        <div className="grid-item-3"><FormInput label="UF Set (L)" name="ufSet" type="number" value={formData.ufSet} onChange={handleChange} /></div>
                        <div className="grid-item-3">
                            <FormSelect 
                                label="Machine Type" 
                                name="machineType" 
                                value={formData.machineType} 
                                onChange={handleChange} 
                                options={machineTypes}
                            />
                        </div>
                        <div className="grid-item-3">
                            <FormSelect 
                                label="Primed By" 
                                name="primedBy" 
                                value={formData.primedBy} 
                                onChange={handleChange} 
                                options={names}
                            />
                        </div>

                        <div className="grid-item-6"><FormInput label="Machine Readings/Setup Notes" name="machineReadings" value={formData.machineReadings} onChange={handleChange} multiline rows={2} /></div>
                        <div className="grid-item-6">
                            {/* Empty space for alignment/future use */}
                        </div>

                        <div className="grid-item-12 form-divider"></div>


                        {/* =======================================================
                            INTRA-DIALYSIS
                        ======================================================= */}
                        <SectionHeader title="Intra-Dialysis Details" />

                        <div className="grid-item-3">
                            <FormSelect 
                                label="Connected By" 
                                name="connectedBy" 
                                value={formData.connectedBy} 
                                onChange={handleChange} 
                                options={names}
                            />
                        </div>
                        <div className="grid-item-3"><FormInput label="Time On" name="intraTime" type="time" value={formData.intraTime} onChange={handleChange} /></div>
                        <div className="grid-item-3">
                            <FormSelect 
                                label="Anticoagulant" 
                                name="anticoagulant" 
                                value={formData.anticoagulant} 
                                onChange={handleChange} 
                                options={['Heparin', 'Citrate', 'None']}
                            />
                        </div>
                        <div className="grid-item-3">
                            <FormSelect 
                                label="Clotting" 
                                name="clotting" 
                                value={formData.clotting} 
                                onChange={handleChange} 
                                options={['Y', 'N']}
                            />
                        </div>

                        <div className="grid-item-3"><FormInput label="Qb (ml/min)" name="qb" type="number" value={formData.qb} onChange={handleChange} /></div>
                        <div className="grid-item-3"><FormInput label="Qd (ml/min)" name="qd" type="number" value={formData.qd} onChange={handleChange} /></div>
                        <div className="grid-item-3"><FormInput label="TMP (mmHg)" name="tmp" type="number" value={formData.tmp} onChange={handleChange} /></div>
                        <div className="grid-item-3"><FormInput label="UF Rate (ml/hr)" name="ufRate" type="number" value={formData.ufRate} onChange={handleChange} /></div>

                        <div className="grid-item-4">
                            <FormSelect 
                                label="Primary Consumable Used" 
                                name="consumable" 
                                value={formData.consumable} 
                                onChange={handleChange} 
                                options={consumables}
                            />
                        </div>
                        <div className="grid-item-8">
                            <FormInput 
                                label="Additional Consumables/Notes" 
                                name="additionalConsumable" 
                                value={formData.additionalConsumable} 
                                onChange={handleChange} 
                                placeholder="e.g., 2 bags Saline"
                            />
                        </div>

                        {/* =======================================================
                            30 MIN INTERVALS
                        ======================================================= */}
                        {renderIntervalFields()}
                        
                        <div className="grid-item-12 form-divider"></div>


                        {/* =======================================================
                            POST-DIALYSIS
                        ======================================================= */}
                        <SectionHeader title="Post-Dialysis & Termination" />

                        <div className="grid-item-3"><FormInput label="BP (mmHg)" name="postBP" value={formData.postBP} onChange={handleChange} /></div>
                        <div className="grid-item-3"><FormInput label="Pulse" name="postPulse" type="number" value={formData.postPulse} onChange={handleChange} /></div>
                        <div className="grid-item-3"><FormInput label="Temp (°C)" name="postTemp" type="number" value={formData.postTemp} onChange={handleChange} /></div>
                        <div className="grid-item-3"><FormInput label="Weight (kg)" name="postWeight" type="number" value={formData.postWeight} onChange={handleChange} /></div>

                        <div className="grid-item-3"><FormInput label="UF Achieved (L)" name="postUFAchieved" type="number" value={formData.postUFAchieved} onChange={handleChange} /></div>
                        <div className="grid-item-3"><FormInput label="KTV" name="postKTV" value={formData.postKTV} onChange={handleChange} /></div>
                        <div className="grid-item-3"><FormInput label="Time Off" name="postTime" type="time" value={formData.postTime} onChange={handleChange} /></div>
                        <div className="grid-item-3">
                            <FormSelect 
                                label="Disconnected By" 
                                name="disconnectedBy" 
                                value={formData.disconnectedBy} 
                                onChange={handleChange} 
                                options={names}
                            />
                        </div>
                        
                        <div className="grid-item-12 form-divider"></div>


                        {/* =======================================================
                            NOTES AND SIGNATURE
                        ======================================================= */}
                        <SectionHeader title="Notes & Patient Signature" />

                        <div className="grid-item-8">
                            <FormInput 
                                label="Clinical Notes / Observations" 
                                name="notes" 
                                value={formData.notes} 
                                onChange={handleChange} 
                                multiline 
                                rows={6} 
                                placeholder="Enter any significant events, complications, or observations during the treatment..."
                            />
                        </div>

                        {/* =======================================================
                            YOUR PREFERRED SIGNATURE BLOCK (grid-item-4)
                        ======================================================= */}
                        <div className="grid-item-4 signature-section-container">
                            <div className="signature-content-wrapper">
                                <p className="signature-title"> Signature:</p>
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


                        {/* SUBMIT BUTTON */}
                        <div className="grid-item-12 center-text mt-40">
                            <div className="form-divider"></div>
                            <motion.button
                                type="submit"
                                className="submit-btn-styled"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                SAVE DIALYSIS CHART
                            </motion.button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Custom Framer Motion Toast for Save/Reset Confirmation */}
            <AnimatePresence>
                {saveSuccess && (
                    <motion.div
                        className="custom-toast custom-toast-success"
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 300, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                        <FaCheckCircle className="toast-icon" />
                        <span className="toast-message">{formData === initialFormData ? 'Dialysis Chart Cleared!' : 'Dialysis Chart Saved Successfully!'}</span>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default DialysisChartPage;