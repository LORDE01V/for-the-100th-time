import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { Dashboard } from './pages/dashboard_page/dashboard';
import { AiSuggestions } from './pages/ai-suggestions_page/ai-suggestions';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomePageComponent },
  { path: 'dashboard', component: Dashboard },
  { path: 'ai-suggestions', component: AiSuggestions },
  { path: '**', redirectTo: '/home' } // Handle 404
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
