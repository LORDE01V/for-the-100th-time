import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './NavigationPanel.css'; // Import the CSS file for styling
import { FiHome } from 'react-icons/fi'; // Keeping FiHome for Home
import { FaSolarPanel, FaUser, FaBatteryFull, FaCoins, FaRegLightbulb, FaTools, FaTree, FaLightbulb, FaRegSun, FaUsers, FaHandshake, FaCreditCard } from 'react-icons/fa';
import { Bot } from 'lucide-react'; // For AI Suggestions

const NavigationPanel = () => {
  const navigate = useNavigate();
  const panelRef = useRef(null);

  // Add state for hover visibility
  const [isVisible, setIsVisible] = useState(false);

  // Function to toggle visibility via trigger
  const togglePanel = () => setIsVisible(true);

  // List of all pages with their names, paths, and icons
  const pages = [
    { name: 'Home', path: '/', icon: <FiHome /> },  // Keeping FiHome as it's appropriate
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
  ];

  // Drag-and-drop functionality
  const handleDragStart = (e) => {
    const panel = panelRef.current;
    const rect = panel.getBoundingClientRect();
    panel.dataset.offsetX = e.clientX - rect.left;
    panel.dataset.offsetY = e.clientY - rect.top;
  };

  const handleDrag = (e) => {
    const panel = panelRef.current;
    if (e.clientX === 0 && e.clientY === 0) return; // Prevent drag end flickering
    const offsetX = parseFloat(panel.dataset.offsetX);
    const offsetY = parseFloat(panel.dataset.offsetY);
    panel.style.left = `${e.clientX - offsetX}px`;
    panel.style.top = `${e.clientY - offsetY}px`;
  };

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
        onMouseEnter={togglePanel}  // Show panel on hover over trigger
        onMouseLeave={() => {}}  // Do nothing on leave from trigger
      >
        ☰  {/* Hamburger icon; you can replace with an actual icon component */}
      </div>

      <div
        className="navigation-panel"
        ref={panelRef}
        draggable="true"
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onMouseEnter={() => setIsVisible(true)}  // Keep panel open on hover
        onMouseLeave={() => setIsVisible(false)}  // Hide panel when mouse leaves
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
              onClick={() => navigate(page.path)}
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
