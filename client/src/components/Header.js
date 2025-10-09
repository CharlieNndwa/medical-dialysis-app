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



// Define Header Height Constant for use in Sidebar.css (approximate)
const MOBILE_HEADER_HEIGHT = '56px';
const DESKTOP_HEADER_HEIGHT = '64px';


const Header = ({ onSidebarToggle, isSidebarCollapsed }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [foundPatient, setFoundPatient] = useState(null); // <--- 🚨 NEW STATE: To track the found patient
    // 🚨 CRITICAL: Get the user object (which should hold the token or we get it from local storage)
  const { user, logout } = useAuth(); // Assume user object contains token/ID
  
const token = localStorage.getItem('token'); 

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 🚨 CRITICAL FIX: The handleSearch function must include the 'headers' object
    const handleSearch = async (e) => {
        // Only run search on Enter key press
        if (e.key !== 'Enter' || !searchTerm.trim()) {
            return;
        }
        e.preventDefault();

        const query = searchTerm.trim();

        try {
            const response = await axios.get(`${API_SERVER_ROOT}/api/patients/search`, {
                params: { q: query },
                // 👇 THIS IS THE CRITICAL FIX for the 401 error 👇
                headers: {
                    'Authorization': `Bearer ${token}` 
                }
            });
            
            // Success logic (from your previous code)
            const patients = response.data;
            if (patients && patients.length > 0) {
                const p = patients[0];
                setFoundPatient(p);
                setSearchTerm(`Found: ${p.fullName} (ID: ${p.id})`);
            } else {
                setFoundPatient(null);
                setSearchTerm(`No patient found for: ${query}`);
            }

        } catch (error) {
            console.error("Patient search failed:", error.response ? error.response.data : error.message);
            // Revert to search term on error
            setSearchTerm(`Search Failed. Try again.`); 
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