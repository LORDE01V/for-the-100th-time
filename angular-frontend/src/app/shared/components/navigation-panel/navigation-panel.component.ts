import { Component, OnInit, OnDestroy, Renderer2, ElementRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { 
  faHome,
  faArrowLeft,
  faSolarPanel,
  faUser,
  faBatteryFull,
  faCoins,
  faLightbulb,
  faTools,
  faTree,
  faSun,
  faUsers,
  faHandshake,
  faCreditCard
} from '@fortawesome/free-solid-svg-icons'; // Using solid icons for most
import { faLightbulb as faLightbulbRegular, faUser as faUserRegular, faSun as faSunRegular } from '@fortawesome/free-regular-svg-icons';
import { faRobot } from '@fortawesome/free-solid-svg-icons'; // For Bot/AI Suggestions
import { ThemeService } from '@services/theme.service'; // Changed path to use alias
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common'; // Import CommonModule for ngIf/ngFor
import { RouterModule } from '@angular/router'; // Import RouterModule for routerLink
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'; // Import FontAwesomeModule

@Component({
  selector: 'app-navigation-panel',
  templateUrl: './navigation-panel.component.html',
  styleUrls: ['./navigation-panel.component.scss'],
  standalone: true, // Make standalone
  imports: [
    CommonModule,
    RouterModule,
    FontAwesomeModule,
  ]
})
export class NavigationPanelComponent implements OnInit, OnDestroy {
  isVisible: boolean = false;
  currentPath: string = '';
  private routerSubscription: Subscription = new Subscription();
  private themeSubscription: Subscription = new Subscription();

  // Font Awesome icons
  faHome = faHome;
  faArrowLeft = faArrowLeft;
  faSolarPanel = faSolarPanel;
  faUser = faUser;
  faBatteryFull = faBatteryFull;
  faCoins = faCoins;
  faLightbulb = faLightbulb;
  faTools = faTools;
  faTree = faTree;
  faSun = faSun;
  faUsers = faUsers;
  faHandshake = faHandshake;
  faCreditCard = faCreditCard;
  faRobot = faRobot;

  // Chakra UI like colors
  triggerBgColor: string = 'white';
  triggerTextColor: string = 'teal.500';
  panelBg: string = 'white';
  panelBorderColor: string = 'gray.200';

  pages = [
    { name: 'Home', path: '/home', icon: this.faHome },
    { name: 'Dashboard', path: '/dashboard', icon: this.faSolarPanel },
    { name: 'Profile', path: '/profile', icon: this.faUser },
    { name: 'Settings', path: '/settings', icon: this.faTools },
    { name: 'Support', path: '/support', icon: this.faLightbulb },
    { name: 'About', path: '/about', icon: this.faUsers },
    { name: 'AI Suggestions', path: '/ai-suggestions', icon: this.faRobot },
    { name: 'Expenses', path: '/expenses', icon: this.faCoins },
    { name: 'Forum', path: '/forum', icon: this.faSun }, // Using faSun for Forum as a placeholder
    { name: 'Group Buying', path: '/group-buying', icon: this.faUsers },
    { name: 'Impact', path: '/impact', icon: this.faTree },
    { name: 'Notifications', path: '/notifications', icon: faLightbulbRegular }, // Using regular lightbulb
    { name: 'Personal User', path: '/personal-user', icon: faUserRegular }, // Using regular user
    { name: 'Refer', path: '/refer', icon: this.faHandshake },
    { name: 'Subscription', path: '/subscription', icon: this.faCreditCard },
    { name: 'Top Up', path: '/top-up', icon: this.faBatteryFull },
  ];

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private el: ElementRef,
    private themeService: ThemeService
  ) { }

  ngOnInit(): void {
    // Subscribe to theme changes
    this.themeSubscription = this.themeService.colorMode$.subscribe((mode: 'light' | 'dark') => {
      this.triggerBgColor = this.themeService.getColorModeValue('white', 'rgba(0, 0, 0, 0.6)');
      this.triggerTextColor = this.themeService.getColorModeValue('teal.500', 'teal.300');
      this.panelBg = this.themeService.getColorModeValue('white', 'rgba(0, 0, 0, 0.6)');
      this.panelBorderColor = this.themeService.getColorModeValue('gray.200', 'gray.600');
    });

    // Add Back to Dashboard/Home conditionally based on current route
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.currentPath = this.router.url;
      this.updateNavigationLinks();
    });
    this.updateNavigationLinks(); // Initial update
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
    this.themeSubscription.unsubscribe();
  }

  private updateNavigationLinks(): void {
    const backToDashboardLink = { name: 'Back to Dashboard', path: '/dashboard', icon: this.faArrowLeft };
    const backToHomeLink = { name: 'Back to Home', path: '/home', icon: this.faHome };

    // Remove existing back links if present
    this.pages = this.pages.filter(page => 
      page.name !== 'Back to Dashboard' && page.name !== 'Back to Home'
    );

    // Add back links based on current route
    if (this.currentPath !== '/dashboard' && this.currentPath !== '/home') {
      // Assuming if not on home or dashboard, can go back to dashboard
      this.pages.push(backToDashboardLink);
    } else if (this.currentPath === '/dashboard') {
      // If on dashboard, can go back to home
      this.pages.push(backToHomeLink);
    }
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
    this.isVisible = false; // Hide panel after navigation
  }

  toggleVisibility(): void {
    this.isVisible = !this.isVisible;
  }
}