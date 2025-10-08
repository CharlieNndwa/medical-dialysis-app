import React, { useState } from 'react';
import {
  Typography,
  Box,
  TextField,
  Grid,
  Button,
  Paper,
  MenuItem, // For month selection
  Select,   // For month selection
  FormControl, // For month selection
  InputLabel, // For month selection
  Alert,    // For displaying success/error messages within the form
} from '@mui/material';
import axios from 'axios';

// Pass onSaveSuccess prop to the component
const MedicalNotesForm = ({ onSaveSuccess }) => {
  const [formData, setFormData] = useState({
    note_year: new Date().getFullYear().toString(), // Default to current year
    note_month: (new Date().getMonth() + 1).toString(), // Default to current month (1-indexed)
    name: '',
    surname: '',
    diagnosis: '',
    medical_aid_name: '',
    medical_aid_no: '',
    doctor: '',
    access: '',
    needle_size: '',
    port_length: '',
    height: '',
    age: '',

    dialyzer: '',
    dry_weight: '',
    dialysate_speed_qd: '',
    blood_pump_speed_qb: '',
    treatment_hours: '',
    anticoagulation_and_dose: '',

    date: '', // Will be set by date picker
    time_on: '', // Will be set by time picker
    primed_by: '',
    stock_utilised: '',

    weight: '',
    blood_pressure: '',
    pulse: '',
    blood_glucose: '',
    temperature: '',
    hgt: '',
    saturation: '',
    post_connection_bp: '',

    pre_disconnection_bp: '',
    post_disconnection_bp: '',
    w_post: '',
    qd_post: '',
    qb_post: '',
    uf: '',
    ktv: '',
    time_of: '', // Will be set by time picker
    disconnected_by: '',
  });

  const [formStatus, setFormStatus] = useState({
    success: null,
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Helper for generating month options
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: new Date(0, i).toLocaleString('en-US', { month: 'long' }),
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ success: null, message: '' }); // Reset status

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/medical-notes',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setFormStatus({ success: true, message: 'Medical record saved successfully!' });
      // Clear form after success
      setFormData({
        note_year: new Date().getFullYear().toString(),
        note_month: (new Date().getMonth() + 1).toString(),
        name: '', surname: '', diagnosis: '', medical_aid_name: '', medical_aid_no: '',
        doctor: '', access: '', needle_size: '', port_length: '', height: '', age: '',
        dialyzer: '', dry_weight: '', dialysate_speed_qd: '', blood_pump_speed_qb: '',
        treatment_hours: '', anticoagulation_and_dose: '', date: '', time_on: '',
        primed_by: '', stock_utilised: '', weight: '', blood_pressure: '', pulse: '',
        blood_glucose: '', temperature: '', hgt: '', saturation: '', post_connection_bp: '',
        pre_disconnection_bp: '', post_disconnection_bp: '', w_post: '', qd_post: '',
        qb_post: '', uf: '', ktv: '', time_of: '', disconnected_by: '',
      });
      if (onSaveSuccess) {
        onSaveSuccess(); // Call the prop to close dialog and refresh dashboard
      }
    } catch (error) {
      console.error('Error submitting form:', error.response ? error.response.data : error.message);
      setFormStatus({ success: false, message: error.response?.data?.error || 'Failed to save medical record.' });
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 0 }}> {/* Removed elevation for modal content */}
      {formStatus.message && (
        <Alert severity={formStatus.success ? 'success' : 'error'} sx={{ mb: 2 }}>
          {formStatus.message}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        {/* Year and Month */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Year"
                name="note_year"
                type="number"
                value={formData.note_year}
                onChange={handleChange}
                inputProps={{ min: 1900, max: 2100 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Month</InputLabel>
                <Select
                  name="note_month"
                  value={formData.note_month}
                  label="Month"
                  onChange={handleChange}
                >
                  {months.map((month) => (
                    <MenuItem key={month.value} value={month.value}>
                      {month.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {/* General Patient Details Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Patient & General Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Name" name="name" value={formData.name} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Surname" name="surname" value={formData.surname} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Diagnosis" name="diagnosis" value={formData.diagnosis} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Medical Aid Name" name="medical_aid_name" value={formData.medical_aid_name} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Medical Aid No" name="medical_aid_no" value={formData.medical_aid_no} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Doctor" name="doctor" value={formData.doctor} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Access" name="access" value={formData.access} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Needle Size" name="needle_size" value={formData.needle_size} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Port Length" name="port_length" value={formData.port_length} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Height" name="height" type="number" value={formData.height} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Age" name="age" type="number" value={formData.age} onChange={handleChange} />
            </Grid>
          </Grid>
        </Box>

        {/* Dialysis Prescription Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Dialysis Prescription
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Dialyzer" name="dialyzer" value={formData.dialyzer} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Dry Weight" name="dry_weight" type="number" value={formData.dry_weight} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Dialysate Speed (Qd)" name="dialysate_speed_qd" type="number" value={formData.dialysate_speed_qd} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Blood Pump Speed (Qb)" name="blood_pump_speed_qb" type="number" value={formData.blood_pump_speed_qb} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Treatment Hours" name="treatment_hours" type="number" value={formData.treatment_hours} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Anticoagulation and Dose" name="anticoagulation_and_dose" value={formData.anticoagulation_and_dose} onChange={handleChange} />
            </Grid>
          </Grid>
        </Box>

        {/* Session Details Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Session Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Date" name="date" type="date" value={formData.date} onChange={handleChange} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Time On" name="time_on" type="time" value={formData.time_on} onChange={handleChange} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Primed By" name="primed_by" value={formData.primed_by} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Stock Utilised" name="stock_utilised" value={formData.stock_utilised} onChange={handleChange} />
            </Grid>
          </Grid>
        </Box>

        {/* Pre-assessment Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Pre-assessment
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Weight" name="weight" type="number" value={formData.weight} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Blood Pressure" name="blood_pressure" value={formData.blood_pressure} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Pulse" name="pulse" type="number" value={formData.pulse} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Blood Glucose" name="blood_glucose" type="number" value={formData.blood_glucose} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Temperature" name="temperature" type="number" value={formData.temperature} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Hgt" name="hgt" type="number" value={formData.hgt} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Saturation" name="saturation" type="number" value={formData.saturation} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Post Connection BP" name="post_connection_bp" value={formData.post_connection_bp} onChange={handleChange} />
            </Grid>
          </Grid>
        </Box>

        {/* Post-dialysis Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Post-dialysis
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Pre-disconnection BP" name="pre_disconnection_bp" value={formData.pre_disconnection_bp} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Post-disconnection BP" name="post_disconnection_bp" value={formData.post_disconnection_bp} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="W" name="w_post" type="number" value={formData.w_post} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Qd" name="qd_post" type="number" value={formData.qd_post} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Qb" name="qb_post" type="number" value={formData.qb_post} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Uf" name="uf" type="number" value={formData.uf} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Ktv" name="ktv" value={formData.ktv} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Time Of" name="time_of" type="time" value={formData.time_of} onChange={handleChange} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Disconnected By" name="disconnected_by" value={formData.disconnected_by} onChange={handleChange} />
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            sx={{ px: 5, py: 1.5 }}
          >
            Save Medical Record
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default MedicalNotesForm;