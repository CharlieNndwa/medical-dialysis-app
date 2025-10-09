// FILE: Header.js (FIXED CODE)

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios'; // <--- 🚨 NEW IMPORT: Add axios
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  AppBar,
  Toolbar,
} from '@mui/material';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import './Header.css';
import dialysisIcon from '../assets/dialysis-icon.png';

// 🚨 NEW CONSTANT: Define the API root (based on your saved config)
const API_SERVER_ROOT = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Placeholder function for search logic (as requested to be fixed later)
const handleSearch = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    console.log("Searching for:", e.target.value);
  }
};

// Define Header Height Constant for use in Sidebar.css (approximate)
const MOBILE_HEADER_HEIGHT = '56px';
const DESKTOP_HEADER_HEIGHT = '64px';


const Header = ({ onSidebarToggle, isSidebarCollapsed }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [foundPatient, setFoundPatient] = useState(null); // <--- 🚨 NEW STATE: To track the found patient
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 🚨 NEW ASYNC FUNCTION: Implements the search logic
  const handleSearch = async (e) => {
    if (e.key !== 'Enter' || !searchTerm.trim()) {
      return;
    }
    e.preventDefault();

    const query = searchTerm.trim();

    try {
      // Call the new backend search endpoint: /api/patients/search?q=query
      const response = await axios.get(`${API_SERVER_ROOT}/api/patients/search`, {
        params: { q: query }
      });

      const results = response.data;

      if (results && results.length > 0) {
        // Found patient, update the display as requested (name and ID)
        const patient = results[0];
        setFoundPatient(patient);
        // 🎯 FULFILLS USER REQUEST: Update search bar to display the result
        setSearchTerm(`${patient.fullName} (ID: ${patient.id})`);

        // 💡 UX Improvement: You can navigate to the details page here
        // navigate(`/patient-details/${patient.id}`); 

      } else {
        // No result found
        setSearchTerm(`No patient found for "${query}"`);
        setFoundPatient(null);
      }

    } catch (error) {
      console.error("Patient search failed:", error.response ? error.response.data : error.message);
      setSearchTerm(`Error searching: ${query}`);
      setFoundPatient(null);
    }
  };

  // 🚨 NEW CHANGE HANDLER: Resets state to allow for typing after a search
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // If user starts typing, clear the previous "result" or "error" message
    if (foundPatient) {
      setFoundPatient(null);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <AppBar
      position="fixed"
      sx={{
        bgcolor: '#2c3e50',
        boxShadow: 3,
        // 🚨 FIX: Ensure the Header's zIndex is higher than the Sidebar so it renders on top
        zIndex: (theme) => theme.zIndex.drawer + 1,
        height: { xs: MOBILE_HEADER_HEIGHT, sm: DESKTOP_HEADER_HEIGHT },

        // ❌ REMOVED: The custom 'width' and 'ml' logic. 
        // AppBar defaults to width: 100%, which is what you want.
      }}
    >
      <Toolbar
        className="app-header-toolbar"
        sx={{
          justifyContent: 'space-between',
          // Ensures toolbar fills the height of the AppBar
          minHeight: { xs: MOBILE_HEADER_HEIGHT, sm: DESKTOP_HEADER_HEIGHT },
          px: { xs: 1, sm: 3 }
        }}
      >

        {/* Logo/Icon Area - Left Aligned */}
        <Box
          component="img"
          src={dialysisIcon}
          alt="Dialysis System Logo"
          sx={{
            height: '32px',
            display: 'block',
            mr: { xs: 1, sm: 3 }
          }}
        />

        {/* Search Component */}
        <Box
          className="header-search-box"
          sx={{
            flexGrow: 1,
            display: 'flex',
            justifyContent: 'flex-start',
            maxWidth: { xs: '65%', sm: '450px' }
          }}
        >
          <Box className="search-input-container">
            <SearchIcon sx={{ color: 'white', mr: 1 }} />
            <InputBase
              placeholder="Search Patient Name or ID..."
              inputProps={{ 'aria-label': 'search' }}
              value={searchTerm}
              onChange={handleSearchChange}  
              onKeyDown={handleSearch}      
              sx={{
                color: 'white',
                width: '100%',
              }}
            />
          </Box>
        </Box>

        {/* User Info & Logout */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 0.5, sm: 2 },
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 500,
              color: 'white',
              display: { xs: 'none', sm: 'block' }
            }}
          >
            Signed in:
            <CheckCircleIcon sx={{ color: 'lightgreen', ml: 1, verticalAlign: 'middle' }} />
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleLogout}
            sx={{
              fontWeight: 600,
              bgcolor: '#e74c3c',
              '&:hover': {
                bgcolor: '#c0392b',
              },
              minWidth: { xs: 'auto', sm: 100 },
              fontSize: { xs: '0.7rem', sm: '0.875rem' },
              padding: { xs: '4px 8px', sm: '6px 16px' }
            }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;