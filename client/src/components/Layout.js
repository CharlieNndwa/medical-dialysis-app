// client/src/components/Layout.js
import React from 'react';
import { Box } from '@mui/material';
import { useLocation } from 'react-router-dom';
import MedicalBackground from '../assets/background.jpg'; // Assuming you have this image

const Layout = ({ children }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        // Conditional background for auth pages
        backgroundImage: isAuthPage ? `url(${MedicalBackground})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundColor: isAuthPage ? 'rgba(0,0,0,0.5)' : '#f5f7fa', // Dark overlay for login, light for dashboard
        backgroundBlendMode: isAuthPage ? 'darken' : 'none',
      }}
    >
      {children}
    </Box>
  );
};

export default Layout;