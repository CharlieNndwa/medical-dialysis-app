// FILE: Sidebar.js (FULL CORRECTED CODE - Ensures all mobile text displays)

import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion'; 
import { 
    FaTachometerAlt, 
    FaUser, 
    FaHistory, 
    FaClipboardList,
} from 'react-icons/fa';
import './Sidebar.css';
import { BiDockLeft } from "react-icons/bi";

// Define the complete, structured list of navigation items
const navItems = [
    // Dashboard and other tabs will use 'name' on both desktop and mobile
    { name: 'Dashboard', path: '/dashboard', icon: FaTachometerAlt },
    { name: 'Patient Details', path: '/patient-details', icon: FaUser },
    // Hemodialysis Records uses 'mobileName' on mobile and 'name' on desktop
    { name: 'Hemodialysis Records', mobileName: 'Hemodialysis', path: '/hemodialysis-records', icon: FaHistory },
    { name: 'Progress Log', path: '/progress-log', icon: FaClipboardList },
];

const Sidebar = ({ isCollapsed, toggleSidebar }) => {

    const sidebarVariants = {
        hidden: { 
            opacity: 1, 
            x: 0, 
            transition: { duration: 0.3 }
        }, 
        visible: { 
            opacity: 1, 
            x: 0, 
            transition: {
                type: "spring",
                stiffness: 500,
                damping: 30,
                delay: 0.1, 
                duration: 0.5 
            } 
        },
    };

    return (
        <motion.div 
            className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}
            variants={sidebarVariants} 
            initial="hidden" 
            animate="visible" 
        >
            <div className="sidebar-header">
                <button 
                    onClick={toggleSidebar} 
                    className="icon-btn-transparent"
                >
                    <BiDockLeft />
                </button>
            </div>
            
            <nav className="sidebar-nav">
                <ul>
                    {navItems.map((item) => (
                        <li key={item.name}>
                            <NavLink to={item.path} className={({ isActive }) => isActive ? "active" : ""}>
                                <item.icon />
                                
                                {/* 🎯 CRITICAL FIX: Use a single span to hold the correct name based on screen size */}
                                {/* The text content will be managed by a CSS media query */}
                                <span className="nav-text" data-desktop={item.name} data-mobile={item.mobileName || item.name}>
                                    {/* Default content for JS-disabled or fallback */}
                                    {item.name}
                                </span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </motion.div>
    );
};

export default Sidebar;