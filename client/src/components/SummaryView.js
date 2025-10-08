// src/components/SummaryView.js

import React from 'react';
import { Box, Typography, Grid, Divider } from '@mui/material';

const SummaryView = ({ data }) => {
  if (!data) return null;

  const renderSection = (title, items) => (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <Grid container spacing={2}>
        {items.map((item, index) => (
          item.value && (
            <Grid item xs={12} sm={6} key={index}>
              <Typography variant="body1">
                <strong>{item.label}:</strong> {item.value}
              </Typography>
            </Grid>
          )
        ))}
      </Grid>
      <Divider sx={{ mt: 2 }} />
    </Box>
  );

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, textAlign: 'center', fontWeight: 'bold' }}>
        Hemodialysis Record Summary
      </Typography>

      {renderSection('Patient Details', [
        { label: 'Name', value: data.name },
        { label: 'Surname', value: data.surname },
        { label: 'Diagnosis', value: data.diagnosis },
        { label: 'Medical Aid No', value: data.medical_aid_no },
        { label: 'Doctor', value: data.doctor },
      ])}
      
      {renderSection('Session Details', [
        { label: 'Date', value: data.date },
        { label: 'Time On', value: data.time_on },
        { label: 'Time Off', value: data.time_of },
        { label: 'Primed By', value: data.primed_by },
      ])}

      {renderSection('Dialysis Metrics', [
        { label: 'Dry Weight', value: data.dry_weight },
        { label: 'Weight (Pre)', value: data.weight },
        { label: 'Weight (Post)', value: data.w_post },
        { label: 'Blood Pressure (Pre)', value: data.blood_pressure },
        { label: 'Blood Pressure (Post)', value: data.post_disconnection_bp },
      ])}

    </Box>
  );
};

export default SummaryView;