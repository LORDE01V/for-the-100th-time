import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AISuggestionsComponent } from './pages/ai-suggestions/ai-suggestions.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { AuthGuard } from './auth.guard';
// Add missing component imports
import { GroupBuyingComponent } from './pages/group-buying/group-buying.component';
import { LoadSheddingPageComponent } from './pages/load-shedding-page/load-shedding-page.component';
import { SupportPageComponent } from './pages/support-page/support-page.component';
import { ForumPageComponent } from './pages/forum-page/forum-page.component';
import { ReferPageComponent } from './pages/refer-page/refer-page.component';
import { ImpactPageComponent } from './pages/impact-page/impact-page.component';
import { ExpensesPageComponent } from './pages/expenses-page/expenses-page.component';
import { SettingsPageComponent } from './pages/settings-page/settings-page.component';
import { NotificationsPageComponent } from './pages/notifications-page/notifications-page.component';
import { PersonalUserPageComponent } from './pages/personal-user-page/personal-user-page.component';
import { PrivacyPolicyPageComponent } from './pages/privacy-policy-page/privacy-policy-page.component';
import { TermsOfServicePageComponent } from './pages/terms-of-service-page/terms-of-service-page.component';
import { SubscriptionPageComponent } from './pages/subscription-page/subscription-page.component';
import { TopUpPageComponent } from './pages/top-up-page/top-up-page.component';

const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
  { path: 'home', component: HomeComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard] 
  },
  { path: 'ai-suggestions', component: AISuggestionsComponent },
  { path: 'group-buying', component: GroupBuyingComponent },
  { path: 'loadshedding', component: LoadSheddingPageComponent },
  { path: 'support', component: SupportPageComponent },
  { path: 'forum', component: ForumPageComponent },
  { path: 'refer', component: ReferPageComponent },
  { path: 'impact', component: ImpactPageComponent },
  { path: 'expenses', component: ExpensesPageComponent },
  { path: 'settings', component: SettingsPageComponent },
  { path: 'notifications', component: NotificationsPageComponent },
  { path: 'personal-user', component: PersonalUserPageComponent },
  { path: 'privacy-policy', component: PrivacyPolicyPageComponent },
  { path: 'terms-of-service', component: TermsOfServicePageComponent },
  { path: 'subscription', component: SubscriptionPageComponent },
  { path: 'top-up', component: TopUpPageComponent },
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }