import React from 'react';
import { Routes, Route } from 'react-router-dom';
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
import LoadSheddingPage from './pages/LoadSheddingPage';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import AboutPage from './pages/AboutPage';
import OAuthCallbackHandler from './pages/OAuthCallbackHandler';

function App() {
  return (
    <ChakraProvider>
      <TransactionsProvider>
        <Routes>
          <Route path='/' element={<LandingPage />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/home' element={<HomePage />} />
          <Route path='/about' element={<AboutPage />} />
          <Route path='/auth/callback' element={<OAuthCallbackHandler />} />
          <Route path='/dashboard' element={<DashboardPage />} />
          <Route path='/top-up' element={<TopUpPage />} />
          <Route path='/settings' element={<SettingsPage />} />
          <Route path='/impact' element={<ImpactPage />} />
          <Route path='/expenses' element={<ExpensesPage />} />
          <Route path='/notifications' element={<NotificationsPage />} />
          <Route path='/support' element={<SupportPage />} />
          <Route path='/forum' element={<ForumPage />} />
          <Route path='/loadshedding' element={<LoadSheddingPage />} />
          <Route path='/refer' element={<ReferPage />} />
          <Route path='/group-buying' element={<GroupBuying />} />
          <Route path='/subscription' element={<SubscriptionPage />} />
          <Route path='/ai-suggestions' element={<AISuggestions />} />
          <Route path='/personal-user' element={<PersonalUserPage />} />
          <Route path='/fault-details' element={<FaultDetails />} />
          <Route path='/privacy-policy' element={<PrivacyPolicyPage />} />
          <Route path='/terms-of-service' element={<TermsOfServicePage />} />
          <Route path='*' element={<LandingPage />} />
        </Routes>
      </TransactionsProvider>
    </ChakraProvider>
  );
}

export default App;