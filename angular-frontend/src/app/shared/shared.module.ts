import { NgModule, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { ErrorBoundaryComponent, GlobalErrorHandler } from './components/error-boundary/error-boundary.component';
import { DashboardCardComponent } from './components/dashboard-card/dashboard-card.component';
import { HeroTypingTitleComponent } from './components/hero-typing-title/hero-typing-title.component';
import { ThemeToggleButtonComponent } from './components/theme-toggle-button/theme-toggle-button.component';
import { FooterComponent } from './components/footer/footer.component';
import { NavigationPanelComponent } from './components/navigation-panel/navigation-panel.component';
import { AiTipsPanelComponent } from './components/ai-tips-panel/ai-tips-panel.component';
import { FaultVisualizationComponent } from './components/fault-visualization/fault-visualization.component';
import { ImpactMapPreviewComponent } from './components/impact-map-preview/impact-map-preview.component';
import { SavingsChartComponent } from './components/savings-chart/savings-chart.component';
import { SuggestionTrendChartComponent } from './components/suggestion-trend-chart/suggestion-trend-chart.component';
import { SupportbotComponent } from './components/supportbot/supportbot.component'; // Import SupportbotComponent
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [
    LoadingSpinnerComponent,
    ErrorBoundaryComponent,
    DashboardCardComponent,
    HeroTypingTitleComponent,
    FooterComponent
  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
    RouterModule,
    ThemeToggleButtonComponent,
    NavigationPanelComponent,
    AiTipsPanelComponent,
    FaultVisualizationComponent,
    ImpactMapPreviewComponent,
    SavingsChartComponent,
    SuggestionTrendChartComponent,
    SupportbotComponent
  ],
  exports: [
    LoadingSpinnerComponent,
    ErrorBoundaryComponent,
    DashboardCardComponent,
    HeroTypingTitleComponent,
    FooterComponent,
    ThemeToggleButtonComponent,
    NavigationPanelComponent,
    AiTipsPanelComponent,
    FaultVisualizationComponent,
    ImpactMapPreviewComponent,
    SavingsChartComponent,
    SuggestionTrendChartComponent,
    SupportbotComponent,
    FontAwesomeModule
  ],
  providers: [
    { provide: ErrorHandler, useClass: GlobalErrorHandler }
  ]
})
export class SharedModule { }