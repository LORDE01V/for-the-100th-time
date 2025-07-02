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
import { SubscriptionProvider } from './context/SubscriptionContext';

import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import AboutPage from './pages/AboutPage';
import OAuthCallbackHandler from './pages/OAuthCallbackHandler';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import TopUpPage from './pages/TopUpPage';
import SettingsPage from './pages/SettingsPage';
import ImpactPage from './pages/ImpactPage';
import ExpensesPage from './pages/ExpensesPage';
import NotificationsPage from './pages/NotificationsPage';
import SupportPage from './pages/SupportPage';
import ForumPage from './pages/ForumPage';
import ReferPage from './pages/ReferPage';
import GroupBuying from './pages/GroupBuying';
import SubscriptionPage from './pages/SubscriptionPage';
import AISuggestions from './pages/AISuggestions';
import PersonalUserPage from './pages/PersonalUserPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';

// Protected Route component
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
          <SubscriptionProvider>
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
                  <Route path="/ai-suggestions" element={<AISuggestions />} />
                  <Route path="/personal-user" element={<PersonalUserPage />} />
                  <Route path="/fault-details" element={<FaultDetails />} /> {/* Fault Details route */}
                </Route>

                {/* New Routes */}
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms-of-service" element={<TermsOfServicePage />} />

                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <Supportbot />
            </Router>
          </SubscriptionProvider>
        </DashboardProvider>
      </ChakraProvider>
    </ErrorBoundary>
  );
}

export default App;