import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router'; // For navigation
import { FormsModule } from '@angular/forms'; // For ngModel on inputs
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'; // For sanitizing image URLs

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule], // Add FormsModule for two-way binding
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {

  // Subscription Plans (directly in component for now, could be service)
  subscriptionPlans = [
    { id: 'basic-lite', name: 'Basic Lite', price: 29, description: 'Entry-level plan for basic energy monitoring.' },
    { id: 'basic', name: 'Basic', price: 49, description: 'Enhanced monitoring and basic analytics.' },
    { id: 'basic-plus', name: 'Basic Plus', price: 69, description: 'Advanced analytics and some premium features.' },
    { id: 'standard-lite', name: 'Standard Lite', price: 79, description: 'Comprehensive energy management for small homes.' },
    { id: 'standard', name: 'Standard', price: 99, description: 'Full features for average households, including AI tips.' },
    { id: 'standard-plus', name: 'Standard Plus', price: 119, description: 'Premium features for larger homes and businesses.' },
    { id: 'premium', name: 'Premium', price: 149, description: 'Full access to all features, priority support.' },
    { id: 'premium-plus', name: 'Premium Plus', price: 309, description: 'Ultimate energy management, personalized coaching.' },
  ];

  // Theme presets (simplified to apply CSS classes/variables)
  themePresets = {
    arcticBlue: {
      bg: 'rgba(173, 216, 230, 0.18)',
      borderColor: 'rgba(173, 216, 230, 0.35)',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
    },
    warmSunrise: {
      bg: 'rgba(255, 223, 186, 0.18)',
      borderColor: 'rgba(255, 183, 94, 0.35)',
      boxShadow: '0 8px 32px 0 rgba(255, 183, 94, 0.18)',
    },
  };

  // State variables (using Angular signals)
  enabledWidgets = signal<string[]>([]);
  isLoading = signal(false);
  recommendedPlan = signal<any>(null); // From useSubscription context
  location = signal<{ type: string; areaId: string; label: string }>({
    type: 'area',
    areaId: 'johannesburg',
    label: 'Johannesburg',
  });
  colorMode = signal<'light' | 'dark'>('dark'); // Default to dark mode as per React code

  // Image paths
  dashboardBgPath: SafeUrl;

  // Computed property for glass card style
  glassCardStyle = computed(() => ({
    'background-color': this.themePresets.arcticBlue.bg,
    'border': '2px solid rgba(255,255,255,0.7)',
    'border-color': this.themePresets.arcticBlue.borderColor,
    'box-shadow': this.themePresets.arcticBlue.boxShadow,
    'backdrop-filter': 'blur(16px)',
    '-webkit-backdrop-filter': 'blur(16px)',
    'border-radius': '2rem', // '2xl' in Chakra UI often maps to 2rem
    'transition': 'background 0.3s, border 0.3s',
  }));

  // Computed property for bubble button style
  bubbleButtonProps = computed(() => ({
    'border-radius': '9999px', // full
    'width': '56px',
    'height': '56px',
    'font-size': '2rem', // 2xl
    'box-shadow': '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06)', // lg
    'background-color': '#4FD1C5', // teal.400
    'color': 'white',
    'border': '4px solid white',
    'z-index': '9999',
  }));

  constructor(private router: Router, private sanitizer: DomSanitizer) {
    this.dashboardBgPath = this.sanitizer.bypassSecurityTrustUrl('assets/images/Mpho_Jesica_Create_a_high-resolution_background_image_for_a_modern_energy_man_afcb404c-1dac-4159-b82d-73e5d60dcf59.png');
  }

  ngOnInit(): void {
    // Mimic DashboardContext's setEnabledWidgets initialization
    if (this.enabledWidgets().length === 0) {
      this.enabledWidgets.set(['EnergyModeToggle', 'BudgetDial', 'ThemeSwitcher', 'SolarOutput', 'DailyForecast', 'WidgetLayout', 'EnergyAvatar', 'ActivityReport', 'AITipsPanel', 'FaultDetection', 'FaultVisualization']);
    }

    // Mock initial recommended plan (from useSubscription context)
    this.recommendedPlan.set(this.mockSuggestPlan({ budget: 600 })); // Example initial value
  }

  mockSuggestPlan(data: { budget?: number }) {
    if (!data || !data.budget) return this.subscriptionPlans[0];
    const suitablePlan = this.subscriptionPlans.reduce((bestPlan, plan) => {
      if (plan.price <= (data.budget || 0) && plan.price > bestPlan.price) {
        return plan;
      }
      return bestPlan;
    }, this.subscriptionPlans[0]);
    return suitablePlan;
  }

  suggestPlan(): void {
    this.isLoading.set(true);
    // Simulate API call
    setTimeout(() => {
      try {
        const mockData = {
          usageHours: 10,
          budget: 500,
          deviceCount: 5
        };
        const plan = this.mockSuggestPlan(mockData);
        this.recommendedPlan.set(plan);
        console.log(`Recommended: ${plan.name}`); // Replaces toast
      } catch (error) {
        console.error('Failed to fetch recommendation:', error); // Replaces toast
      } finally {
        this.isLoading.set(false);
      }
    }, 1000); // Simulate network delay
  }

  onLocationChange(newLocation: { type: string; areaId: string; label: string }): void {
    this.location.set(newLocation);
    console.log('Location updated:', newLocation);
  }

  goBack(): void {
    this.router.navigateByUrl('/'); // Or window.history.back();
  }

  toggleColorMode(): void {
    this.colorMode.update(currentMode => currentMode === 'light' ? 'dark' : 'light');
    // You would typically apply a class to the body or root element
    document.documentElement.setAttribute('data-theme', this.colorMode());
    console.log('Toggled color mode to:', this.colorMode());
  }

  // Placeholder for component existence checks (used in template)
  isWidgetEnabled(widgetName: string): boolean {
    return this.enabledWidgets().includes(widgetName);
  }

  viewFaultDetails(panel: any) {
    this.router.navigate(['/fault-details'], { state: { panel } });
  }
}