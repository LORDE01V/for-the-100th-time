import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { auth } from './services/api'; // Assuming auth service is still needed
import SupportBot from './components/Supportbot'; // Import SupportBot
import LoadSheddingPage from './pages/LoadSheddingPage';

// Import all your Chakra UI pages
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import TopUpPage from './pages/TopUpPage';
import SettingsPage from './pages/SettingsPage';
import ImpactPage from './pages/ImpactPage';
import ExpensesPage from './pages/ExpensesPage';
import NotificationsPage from './pages/NotificationsPage';
import SupportPage from './pages/SupportPage';
import ForumPage from './pages/ForumPage';
import AboutPage from './pages/AboutPage'; // Import the AboutPage
import ReferPage from './pages/ReferPage';
import GroupBuying from './pages/GroupBuying';

// Protected Route component
// This component checks if the user is authenticated before rendering the child routes.
const ProtectedRoute = () => {
  const user = auth.getCurrentUser(); // Check if user data/token exists
  if (!user) {
    // If no user (no token), redirect to login
    return <Navigate to="/login" replace />;
  }
  // If user exists, render the nested routes
  return <Outlet />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/about" element={<AboutPage />} /> {/* About Page route */}

        {/* Protected Routes */}
        {/* All routes nested inside this ProtectedRoute will require authentication */}
        <Route element={<ProtectedRoute />}>
          {/* The /home route is the landing page after successful login */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/top-up" element={<TopUpPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/impact" element={<ImpactPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/forum" element={<ForumPage />} />
          <Route path="/loadshedding" element={<LoadSheddingPage />} />
          <Route path="/refer" element={<ReferPage />} />
          <Route path="/group-buying" element={<GroupBuying />} />
          {/* Add other protected routes here if you create more pages */}
        </Route>

        {/* Fallback route */}
        {/* If no other route matches, redirect to the root (RegisterPage) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <SupportBot /> {/* Make sure this is here, outside of Routes */}
    </Router>
  );
}

export default App;
