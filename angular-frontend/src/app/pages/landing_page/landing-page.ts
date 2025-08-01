import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // Needed for ngFor, ngIf
import { Subject, interval, takeUntil } from 'rxjs'; // For managing intervals with RxJS
import { RouterLink } from '@angular/router'; // Import RouterLink

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterLink], // Add RouterLink to imports
  templateUrl: './landing-page.html',
  styleUrls: ['./landing-page.scss'],
})
export class LandingPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>(); // Used to unsubscribe from observables
  private typingTimeout: any; // To store the timeout ID for the typing effect

  // Properties for RotatingGreetingsSection
  southAfricanGreetings: string[] = [
    'Hello',
    'Hallo',
    'Sawubona',
    'Molo',
    'Lotjhani',
    'Sawubona',
    'Dumela',
    'Dumela',
    'Dumela',
    'Avuxeni',
    'Ndaa',
  ];
  currentGreetingIndex: number = 0;
  currentGreeting: string = '';

  // Properties for MeetTheDevelopers
  developers = [
    {
      name: 'Kgothatso Mokgashi',
      role: 'Backend',
      description: "Builds secure, scalable APIs that connect frontend brilliance to solid server logic."
    },
    {
      name: 'Okuhle Gadla',
      role: 'Backend',
      description: "Builds secure, scalable APIs that connect frontend brilliance to solid server logic."
    },
    {
      name: 'Thembelihle Zulu',
      role: 'Database',
      description: "Ensures reliable data structures and optimized queries that keep the app's engine running strong."
    },
    {
      name: 'Mpho Ramokhoase',
      role: 'Frontend',
      description: "Crafts seamless, user-friendly interfaces with an eye for responsive design and smooth interactions."
    },
    {
      name: 'Nkosinathi Radebe',
      role: 'Frontend',
      description: "Brings UI designs to life with pixel-perfect precision and a deep focus on performance."
    }
  ];

  // Image imports for developers - these would typically be handled by Angular's asset management
  // For now, I'll assume direct paths or use placeholder logic.
  // Example: `src/assets/images/IMG Nathii.jpg` -> `/assets/images/IMG Nathii.jpg`
  getImagePath(name: string): string {
    switch (name) {
      case 'Kgothatso Mokgashi':
        return 'assets/images/kg_img.png';
      case 'Okuhle Gadla':
        return 'assets/images/sleigh.png';
      case 'Thembelihle Zulu':
        return 'assets/images/Lihle.png';
      case 'Mpho Ramokhoase':
        return 'assets/images/Mpho.png';
      case 'Nkosinathi Radebe':
        return 'assets/images/IMG Nathii.jpg';
      default:
        return ''; // Or a placeholder image path
    }
  }

  // Properties for the main LandingPage component
  gridXBackground: string = 'assets/images/GridX-IMG.jpg'; // Path to the background image
  currentYear: number = new Date().getFullYear(); // For the footer copyright year

  // Typing effect for Hero Section
  typingMessages: string[] = [
    'Monitor your energy in real-time ⚡️',
    'Predict future usage with AI 🧠',
    'Join the energy-smart community 🌍',
    'Beat load shedding schedules 🔌',
    'Optimize solar investments ☀️',
    'Track daily energy savings 💰',
    'Share power with neighbors 🤝',
    'Analyze consumption patterns 📊',
    'Get outage predictions ⚠️',
    'Compare community usage 👥',
    'Manage battery storage 🔋',
    'Receive smart grid alerts 📲',
    'Plan eco-friendly budgets 🌱',
  ];
  currentTypingMessage: string = '';
  private typingMessageIndex: number = 0;
  private charIndex: number = 0;
  private isDeleting: boolean = false;
  private typingSpeed: number = 100; // milliseconds per character
  private deletingSpeed: number = 50;
  private pauseBeforeDelete: number = 2000;
  private pauseBeforeType: number = 1000;

  // Features data (featureMessages and related logic removed as they were not rotating in React)
  features = [
    {
      icon: 'solar-panel', // Placeholder for icon, will map to CSS classes or actual icons
      title: 'Solar Power Management',
      description: 'Monitor and optimize your solar energy usage in real-time',
    },
    {
      icon: 'chart-line',
      title: 'Smart Financial Tools',
      description: 'Track expenses, manage payments, and save on energy costs',
    },
    {
      icon: 'leaf',
      title: 'Energy Efficiency',
      description: 'Get insights and recommendations to improve your energy consumption',
    },
  ];


  constructor(private router: Router) { }

  ngOnInit(): void {
    // Start rotating greetings
    this.updateGreeting();
    interval(3000).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.currentGreetingIndex = (this.currentGreetingIndex + 1) % this.southAfricanGreetings.length;
      this.updateGreeting();
    });

    // Start typing effect
    this.typeWriterEffect();

    // Removed the rotating feature messages logic as it was not in the original React code
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout); // Clear the typing effect timeout
    }
  }

  // Helper for RotatingGreetingsSection
  updateGreeting(): void {
    this.currentGreeting = this.southAfricanGreetings[this.currentGreetingIndex];
  }

  // Helper for HeroTypingTitle (integrated)
  private typeWriterEffect(): void {
    const currentFullMessage = this.typingMessages[this.typingMessageIndex];

    if (!this.isDeleting) {
      this.currentTypingMessage = currentFullMessage.substring(0, this.charIndex);
      this.charIndex++;

      if (this.currentTypingMessage === currentFullMessage) {
        // Pause after typing, then start deleting
        this.typingTimeout = setTimeout(() => {
          this.isDeleting = true;
          this.typeWriterEffect(); // Immediately call to start deletion
        }, this.pauseBeforeDelete);
      } else {
        this.typingTimeout = setTimeout(() => this.typeWriterEffect(), this.typingSpeed);
      }
    } else {
      this.currentTypingMessage = currentFullMessage.substring(0, this.charIndex);
      this.charIndex--;

      if (this.currentTypingMessage === '') {
        // Finished deleting, move to next message
        this.isDeleting = false;
        this.typingMessageIndex = (this.typingMessageIndex + 1) % this.typingMessages.length;
        this.typingTimeout = setTimeout(() => this.typeWriterEffect(), this.pauseBeforeType);
      } else {
        this.typingTimeout = setTimeout(() => this.typeWriterEffect(), this.deletingSpeed);
      }
    }
  }

  // Event handler for Get Started button
  getStarted(): void {
    this.router.navigate(['/register']);
  }
}
