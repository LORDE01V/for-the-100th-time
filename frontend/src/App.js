import React from 'react';
import {
  Routes,
  Route,
  Navigate,
  Outlet
} from 'react-router-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { auth } from './services/api';
import Supportbot from './components/Supportbot';
import ErrorBoundary from './components/ErrorBoundary';
import { ChakraProvider } from '@chakra-ui/react';
import { TransactionsProvider } from './context/TransactionsContext';
// Import your components and contexts
import HomePage from './pages/HomePage';
import ExpensesPage from './pages/ExpensesPage';
import TopUpPage from './pages/TopUpPage';
import DashboardPage from './pages/DashboardPage';
import ImpactPage from './pages/ImpactPage';
import SettingsPage from './pages/SettingsPage';
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
import FaultDetails from './pages/FaultDetails';
import LoadSheddingPage from './pages/LoadSheddingPage'; // Import LoadSheddingPage
import ThemeToggleButton from './components/ThemeToggleButton'; // Import ThemeToggleButton
// Protected Route component
const ProtectedRoute = () => {
  const user = auth.getCurrentUser();
  console.log('ProtectedRoute: user from localStorage:', user);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
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
                <Route path="/about" element={<AboutPage />} />
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

                {/* Static Pages */}
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms-of-service" element={<TermsOfServicePage />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <Supportbot />
              <ThemeToggleButton />
            </Router>
          </SubscriptionProvider>
        </DashboardProvider>
      </ChakraProvider>
    </ErrorBoundary>
  );
}

export default App;