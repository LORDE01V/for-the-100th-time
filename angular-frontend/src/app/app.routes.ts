import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LandingPageComponent } from './pages/landing_page/landing-page'; // Import the standalone component directly

export const routes: Routes = [
  // Public Routes
  { path: '', component: LandingPageComponent }, // Use the component directly
  { path: 'register', loadComponent: () => import('./pages/register_page/register-page').then(m => m.RegisterPage) },
  { path: 'login', loadComponent: () => import('./pages/login_page/login').then(m => m.Login) },
  { path: 'about', loadComponent: () => import('./pages/about_page/about').then(m => m.About) },
  { path: 'auth/callback', loadComponent: () => import('./pages/oauth-callback-handler_page/oauth-callback-handler').then(m => m.OAuthCallbackHandler) },

  // Protected Routes
  { 
    path: 'home', 
    loadComponent: () => import('./pages/home_page/home').then(m => m.Home),
    canActivate: [authGuard]
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./pages/dashboard_page/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard]
  },
  { 
    path: 'top-up', 
    loadComponent: () => import('./pages/topup_page/topup-page').then(m => m.TopupPage),
    canActivate: [authGuard]
  },
  { 
    path: 'settings', 
    loadComponent: () => import('./pages/settings_page/settings-page').then(m => m.SettingsPage),
    canActivate: [authGuard]
  },
  { 
    path: 'impact', 
    loadComponent: () => import('./pages/impact_page/impact').then(m => m.Impact),
    canActivate: [authGuard]
  },
  { 
    path: 'expenses', 
    loadComponent: () => import('./pages/expenses_page/expenses').then(m => m.Expenses),
    canActivate: [authGuard]
  },
  { 
    path: 'notifications', 
    loadComponent: () => import('./pages/notifications_page/notifications-page').then(m => m.NotificationsPage),
    canActivate: [authGuard]
  },
  { 
    path: 'support', 
    loadComponent: () => import('./pages/support_page/support-page').then(m => m.SupportPage),
    canActivate: [authGuard]
  },
  { 
    path: 'forum', 
    loadComponent: () => import('./pages/forum_page/forum').then(m => m.Forum),
    canActivate: [authGuard]
  },
  { 
    path: 'refer', 
    loadComponent: () => import('./pages/refer_page/refer-page').then(m => m.ReferPage),
    canActivate: [authGuard]
  },
  { 
    path: 'group-buying', 
    loadComponent: () => import('./pages/groupbuying_page/groupbuying').then(m => m.Groupbuying),
    canActivate: [authGuard]
  },
  { 
    path: 'subscription', 
    loadComponent: () => import('./pages/subscription_page/subscription-page').then(m => m.SubscriptionPage),
    canActivate: [authGuard]
  },
  { 
    path: 'ai-suggestions', 
    loadComponent: () => import('./pages/ai-suggestions_page/ai-suggestions').then(m => m.AiSuggestions),
    canActivate: [authGuard]
  },
  { 
    path: 'personal-user', 
    loadComponent: () => import('./pages/person-user_page/person-user-page').then(m => m.PersonUserPage),
    canActivate: [authGuard]
  },
  { 
    path: 'fault-details', 
    loadComponent: () => import('./pages/fault_details_page/faultdetails').then(m => m.Faultdetails),
    canActivate: [authGuard]
  },

  // Static Pages
  { path: 'privacy-policy', loadComponent: () => import('./pages/privacy-policy-page/privacy-policy-page').then(m => m.PrivacyPolicyPage) },
  { path: 'terms-of-service', loadComponent: () => import('./pages/terms-of-service_page/terms-of-service-page').then(m => m.TermsOfServicePage) },

  // Fallback
  { path: '**', redirectTo: '' }
];
