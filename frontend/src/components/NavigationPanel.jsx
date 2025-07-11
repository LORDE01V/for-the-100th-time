import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './NavigationPanel.css'; // Import the CSS file for styling
import { FiHome, FiSettings, FiUser, FiHelpCircle } from 'react-icons/fi'; // Feather icons

const NavigationPanel = () => {
  const navigate = useNavigate();
  const panelRef = useRef(null);

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
    <div
      className="navigation-panel"
      ref={panelRef}
      draggable="true"
      onDragStart={handleDragStart}
      onDrag={handleDrag}
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
  );
};

export default NavigationPanel;
