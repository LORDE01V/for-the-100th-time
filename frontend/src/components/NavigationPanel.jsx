import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Import to access navigation state
import './NavigationPanel.css'; // Import the CSS file for styling
import { FiHome, FiArrowLeft } from 'react-icons/fi'; // Keeping FiHome for Home
import { FaSolarPanel, FaUser, FaBatteryFull, FaCoins, FaRegLightbulb, FaTools, FaTree, FaLightbulb, FaRegSun, FaUsers, FaHandshake, FaCreditCard } from 'react-icons/fa';
import { Bot } from 'lucide-react'; // For AI Suggestions

const NavigationPanel = () => {
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const location = useLocation();  // Get current location to check state

  // Add state for hover visibility
  const [isVisible, setIsVisible] = useState(false);

  // List of all pages with their names, paths, and icons
  const pages = [
    { name: 'Home', path: '/home', icon: <FiHome /> },  // Updated path to '/home' to match the route for HomePage.js
    { name: 'Dashboard', path: '/dashboard', icon: <FaSolarPanel /> },
    { name: 'Profile', path: '/profile', icon: <FaUser /> },
    { name: 'Settings', path: '/settings', icon: <FaTools /> },
    { name: 'Support', path: '/support', icon: <FaLightbulb /> },
    { name: 'About', path: '/about', icon: <FaUsers /> },  // Using FaUsers as a placeholder
    { name: 'AI Suggestions', path: '/ai-suggestions', icon: <Bot /> },
    { name: 'Expenses', path: '/expenses', icon: <FaCoins /> },
    { name: 'Forum', path: '/forum', icon: <FaRegSun /> },
    { name: 'Group Buying', path: '/group-buying', icon: <FaUsers /> },
    { name: 'Impact', path: '/impact', icon: <FaTree /> },
    { name: 'Notifications', path: '/notifications', icon: <FaRegLightbulb /> },
    { name: 'Personal User', path: '/personal-user', icon: <FaUser /> },  // Using FaUser as it's similar to Profile
    { name: 'Refer', path: '/refer', icon: <FaHandshake /> },
    { name: 'Subscription', path: '/subscription', icon: <FaCreditCard /> },
    { name: 'Top Up', path: '/top-up', icon: <FaBatteryFull /> },
    { name: 'Back to Dashboard', path: '/dashboard', icon: <FiArrowLeft /> },  // Assuming FiArrowLeft is imported; if not, use another icon like FiHome
    // Conditionally add Back to Home if coming from homepage
    ...(location.state?.from === 'home' ? [{ name: 'Back to Home', path: '/home', icon: <FiHome /> }] : []),
  ];

  // Remove drag-related functions
  // const handleDragStart = (e) => { ... };  // Removed to prevent dragging
  // const handleDrag = (e) => { ... };  // Removed to prevent dragging

  return (
    <>
      {/* Always-visible trigger button */}
      <div
        style={{
          position: 'fixed',
          top: '20px',  // Adjust position as needed
          left: '10px',
          zIndex: '1000',  // Ensure it's on top
          cursor: 'pointer',
          padding: '10px',
          background: 'rgba(0, 0, 0, 0.7)',
          borderRadius: '50%',
          color: 'white',
        }}
        onMouseEnter={() => setIsVisible(true)}
      >
        ☰  {/* Hamburger icon; you can replace with an actual icon component */}
      </div>

      <div
        className="navigation-panel"
        ref={panelRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        style={{
          transform: isVisible ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease-in-out',
          position: 'fixed',
          left: 0,
          top: 0,
          height: '100vh',
          // ... existing code ...
        }}
      >
        <div className="navigation-header">
          <h2>Energy Dashboard</h2>
        </div>
        <div className="navigation-menu">
          {pages.map((page) => (
            <button
              key={page.name}
              className="navigation-item"
              onClick={() => navigate(page.path)}  // Clicks on 'Home' will call navigate('/')
            >
              <span className="icon">{page.icon}</span>
              <span className="label">{page.name}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default NavigationPanel;
