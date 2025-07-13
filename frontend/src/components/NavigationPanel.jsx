import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './NavigationPanel.css'; // Import the CSS file for styling
import { FiHome, FiSettings, FiUser, FiHelpCircle } from 'react-icons/fi'; // Feather icons

const NavigationPanel = () => {
  const navigate = useNavigate();
  const panelRef = useRef(null);

  // Add state for hover visibility
  const [isVisible, setIsVisible] = useState(false);

  // Function to toggle visibility via trigger
  const togglePanel = () => setIsVisible(true);

  // List of all pages with their names, paths, and icons
  const pages = [
    { name: 'Home', path: '/', icon: <FiHome /> },
    { name: 'Dashboard', path: '/dashboard', icon: <FiHome /> },
    { name: 'Profile', path: '/profile', icon: <FiUser /> },
    { name: 'Settings', path: '/settings', icon: <FiSettings /> },
    { name: 'Support', path: '/support', icon: <FiHelpCircle /> },
    { name: 'About', path: '/about', icon: <FiHelpCircle /> },
    { name: 'AI Suggestions', path: '/ai-suggestions', icon: <FiHelpCircle /> },
    { name: 'Expenses', path: '/expenses', icon: <FiHelpCircle /> },
    { name: 'Fault Details', path: '/fault-details', icon: <FiHelpCircle /> },
    { name: 'Forum', path: '/forum', icon: <FiHelpCircle /> },
    { name: 'Group Buying', path: '/group-buying', icon: <FiHelpCircle /> },
    { name: 'Impact', path: '/impact', icon: <FiHelpCircle /> },
    { name: 'Landing', path: '/landing', icon: <FiHelpCircle /> },
    { name: 'Notifications', path: '/notifications', icon: <FiHelpCircle /> },
    { name: 'OAuth Callback', path: '/oauth-callback', icon: <FiHelpCircle /> },
    { name: 'Personal User', path: '/personal-user', icon: <FiHelpCircle /> },
    { name: 'Privacy Policy', path: '/privacy-policy', icon: <FiHelpCircle /> },
    { name: 'Refer', path: '/refer', icon: <FiHelpCircle /> },
    { name: 'Register', path: '/register', icon: <FiHelpCircle /> },
    { name: 'Subscription', path: '/subscription', icon: <FiHelpCircle /> },
    { name: 'Terms of Service', path: '/terms-of-service', icon: <FiHelpCircle /> },
    { name: 'Top Up', path: '/top-up', icon: <FiHelpCircle /> },
    { name: 'Login', path: '/login', icon: <FiHelpCircle /> }, // Moved under Top Up
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
