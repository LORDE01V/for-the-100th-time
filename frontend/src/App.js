import React from 'react';
import { 
  Routes, 
  Route, 
  Navigate, 
  Outlet 
} from 'react-router-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { auth } from './services/api'; // Assuming auth service is still needed
import Supportbot from './components/Supportbot'; // Correct casing
import LoadSheddingPage from './pages/LoadSheddingPage';
import ErrorBoundary from './components/ErrorBoundary';
import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme';
import { DashboardProvider } from './context/DashboardContext';

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
import OAuthCallbackHandler from './pages/OAuthCallbackHandler';
import SubscriptionPage from './pages/SubscriptionPage';

// Protected Route component
// This component checks if the user is authenticated before rendering the child routes.
const ProtectedRoute = () => {
  const user = auth.getCurrentUser(); // Check if user data/token exists
  console.log('ProtectedRoute: User is', user ? 'authenticated' : 'not authenticated');  // Added for debugging
  if (!user) {
    // If no user (no token), redirect to login
    return <Navigate to="/login" replace />;
  }
  // If user exists, render the nested routes
  return <Outlet />;
};

function App() {
  return (
    <ErrorBoundary>
      <ChakraProvider theme={theme}>
        <DashboardProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/about" element={<AboutPage />} /> {/* About Page route */}

              {/* Add OAuth callback route */}
              <Route path="/auth/callback" element={<OAuthCallbackHandler />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
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
                <Route path="/subscription" element={<SubscriptionPage />} />
              </Route>

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Supportbot />
          </Router>
        </DashboardProvider>
      </ChakraProvider>
    </ErrorBoundary>
  );
}

export default App;
