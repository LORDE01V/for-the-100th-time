import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ApiService } from '../../services/api.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faSolarPanel,
  faBatteryFull,
  faTree,
  faCoins,
  faTools,
  faLightbulb as faSolidLightbulb,
  faHandshake,
  faUsers,
  faCreditCard,
  faBell,
  faSun,
  faSignOutAlt,
  faUser,
  faRobot
} from '@fortawesome/free-solid-svg-icons';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FontAwesomeModule, RouterModule, FormsModule], // Add FontAwesomeModule, RouterModule and FormsModule
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent implements OnInit, OnDestroy {
  // State variables from React component
  isLoadingGreeting: boolean = true;
  aiGreeting: string | null = null;
  greetingError: boolean = false;
  currentTipIndex: number = 0;
  email: string = '';
  private interval: any;

  public faSignOutAlt = faSignOutAlt; // Make faSignOutAlt available in the template

  // Mock user for now, will integrate with ApiService
  user: any = null; // This will hold the user object after login

  // Memoized values from React component
  navItems: (any & { onClick?: () => void })[] = [];
  solarTips: string[] = [];

  constructor(
    private router: Router,
    private http: HttpClient,
    private apiService: ApiService // Inject ApiService
  ) {
    // Initialize navItems and solarTips here or in ngOnInit
    this.initializeNavigationAndTips();
  }

  ngOnInit(): void {
    // Check user authentication
    // Assuming apiService.getCurrentUser() returns user data or null
    this.user = this.apiService.getCurrentUser(); // Replace with actual user fetching
    if (!this.user) {
      // Show toast message (will need a Toast service equivalent in Angular)
      console.warn('Authentication Required: Please log in to access this page');
      setTimeout(() => this.router.navigate(['/login']), 1000);
      return;
    }

    // AI Greeting logic
    this.mockGreetingApi();

    // Solar tips rotation
    this.interval = setInterval(() => {
      this.setCurrentTipIndex((prev) => (prev === this.solarTips.length - 1 ? 0 : prev + 1));
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  private initializeNavigationAndTips(): void {
    this.navItems = [
      { icon: faSolarPanel, title: 'Dashboard', path: '/dashboard', description: 'View your power usage and financial summary', colorScheme: 'blue' },
      { icon: faUser, title: 'Profile Details', path: '/personal-user', description: 'Update your personal information', colorScheme: 'blue' },
      { icon: faBatteryFull, title: 'Top Up', path: '/top-up', description: 'Add credit to your power account', colorScheme: 'green' },
      { icon: faCoins, title: 'Expenses', path: '/expenses', description: 'Track your power expenses', colorScheme: 'purple' },
      { icon: faBell, title: 'Notifications', path: '/notifications', description: 'View your alerts and updates', colorScheme: 'orange' },
      { icon: faTools, title: 'Settings', path: '/settings', description: 'Customize your preferences', colorScheme: 'gray' },
      { icon: faTree, title: 'Impact', path: '/impact', description: 'See your environmental impact', colorScheme: 'teal' },
      { icon: faSolidLightbulb, title: 'Support', path: '/support', description: 'Get help and find answers', colorScheme: 'blue' },
      { icon: faRobot, title: 'AI Suggestions', path: '/ai-suggestions', description: 'Get smart tips from our AI to save energy and manage finances', colorScheme: 'purple' },
      { icon: faSun, title: 'Forum', path: '/forum', description: 'Join the community discussion', colorScheme: 'purple' },
      { icon: faHandshake, title: 'Refer & Earn', path: '/refer', description: 'Invite friends and get rewards', colorScheme: 'orange' },
      { icon: faCreditCard, title: 'Subscriptions', path: '/subscription', description: 'Manage your energy subscription plans', colorScheme: 'blue' },
      { icon: faUsers, title: 'Group Buying', path: '/group-buying', description: 'Join or create group solar purchases and save', colorScheme: 'purple' },
    ];
    this.solarTips = [
      'Consider running high-consumption appliances during peak sunlight hours.',
      'Your battery storage is optimized for evening usage patterns.',
      'Opening curtains can reduce lighting costs by up to 30%.',
      'Current weather patterns suggest ideal solar generation today.',
    ];
  }

  // Helper method for setting tip index
  setCurrentTipIndex(callback: (prev: number) => number): void {
    this.currentTipIndex = callback(this.currentTipIndex);
  }

  // Functions from React component
  getTimeOfDay(): string {
    const hour = new Date().getHours();
    return hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric'
    });
  }

  mockGreetingApi(): void {
    // Simulate API call
    this.isLoadingGreeting = true;
    setTimeout(() => {
      try {
        const message = `🌞 Good ${this.getTimeOfDay()}, ${this.user?.name || "Valued User"}! ` +
          `Here's your personalized energy tip: ${this.solarTips[this.currentTipIndex]}`;
        this.aiGreeting = message;
        this.greetingError = false;
        this.isLoadingGreeting = false;
      } catch (e) {
        this.greetingError = true;
        this.aiGreeting = 'An error occurred while loading the greeting.';
        this.isLoadingGreeting = false;
      }
    }, 500); // Simulate network delay
  }

  handleLogout(): void {
    this.apiService.logout(); // Assuming ApiService handles logout
    this.router.navigate(['/login']);
  }

  async handleNewsletterSubscribe(): Promise<void> {
    if (this.email.includes('@')) {
      try {
        const res = await this.http.post('/api/subscribe', { email: this.email }).toPromise();
        // Assuming the backend returns { success: true } or { error: '...' }
        if (res && (res as any).success) {
          console.log('Subscribed!', 'Check your inbox.');
          // Implement Angular Material or similar for toast messages
        } else {
          console.error('Subscription Failed', (res as any)?.error || 'Could not subscribe.');
        }
      } catch (err) {
        console.error('Network Error', 'Could not subscribe.', err);
      }
    } else {
      console.warn('Invalid Email', 'Please enter a valid email.');
    }
  }

  // Placeholder for OneSignal integration
  async enablePushNotifications(): Promise<void> {
    // OneSignal integration would go here.
    // This typically involves loading the OneSignal SDK and calling its methods.
    // For now, it's a placeholder as direct 'react-onesignal' is not applicable.
    console.log('Enable Push Notifications clicked.');
    // Example: OneSignal.showSlidedownPrompt();
  }

  getIconColorStyle(colorScheme: string): { color: string } {
    return { 'color': `var(--chakra-colors-${colorScheme}-500)` };
  }

  navigateTo(path: string): void {
    if (path === '/dashboard') {
      this.router.navigateByUrl(path, { replaceUrl: true });
    } else {
      this.router.navigate([path]);
    }
  }

}
