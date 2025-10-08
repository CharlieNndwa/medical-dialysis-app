import React from 'react';
import { Card, CardContent, Typography, Box, CardActionArea } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import HealingIcon from '@mui/icons-material/Healing';

const PatientCard = ({ patient }) => {
  // const navigate = useNavigate(); // If you use react-router-dom for detailed view

  const handleCardClick = () => {
    // console.log('View details for patient:', patient.id);
    // Example: navigate(`/patient/${patient.id}`);
    // For now, it just logs, but this is where you'd navigate or open a modal
  };

  return (
    <Card elevation={3} sx={{ borderRadius: 2, height: '100%' }}>
      <CardActionArea onClick={handleCardClick}> {/* Makes the whole card clickable */}
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
            <PersonIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" component="div">
              {patient.name} {patient.surname} {/* Display full name */}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            <Box component="span" sx={{ fontWeight: 'bold' }}>SKU:</Box> {patient.unique_sku}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <HealingIcon color="action" sx={{ mr: 1 }} />
            <Typography variant="body2">
              <Box component="span" sx={{ fontWeight: 'bold' }}>Diagnosis:</Box> {patient.diagnosis || 'N/A'}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
            Last updated: {new Date(patient.record_date).toLocaleDateString()}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default PatientCard;