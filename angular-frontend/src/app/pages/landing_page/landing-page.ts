import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-page.html',
  styleUrls: ['./landing-page.scss']
})
export class LandingPage implements OnInit, OnDestroy {
  // Hero section properties
  heroTitle = 'Welcome to GridX';
  currentMessageIndex = 0;
  messages = [
    "Manage your solar energy and finances in one place. Track usage, optimize costs, and make smarter energy decisions.",
    "Take control of your energy future. Monitor solar production and reduce your carbon footprint.",
    "Smart financial tools for sustainable living. Save money while saving the planet.",
    "Real-time insights into your energy consumption. Make informed decisions for a greener tomorrow.",
    "Join the renewable energy revolution. Power your home with clean, sustainable energy."
  ];

  // Greetings section properties
  currentGreetingIndex = 0;
  greetings = [
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

  // Original Features section
  features = [
    {
      icon: 'solar_power',
      title: 'Solar Power Management',
      description: 'Monitor and optimize your solar energy usage in real-time'
    },
    {
      icon: 'trending_up',
      title: 'Smart Financial Tools',
      description: 'Track expenses, manage payments, and save on energy costs'
    },
    {
      icon: 'eco',
      title: 'Energy Efficiency',
      description: 'Get insights and recommendations to improve your energy consumption'
    }
  ];

  // Developers section
  developers = [
    {
      name: 'Kgothatso Mokgashi',
      role: 'Backend',
      description: "Builds secure, scalable APIs that connect frontend brilliance to solid server logic.",
      image: '/assets/images/kg_img.png'
    },
    {
      name: 'Okuhle Gadla',
      role: 'Backend',
      description: "Builds secure, scalable APIs that connect frontend brilliance to solid server logic.",
      image: '/assets/images/sleigh.png'
    },
    {
      name: 'Thembelihle Zulu',
      role: 'Database',
      description: "Ensures reliable data structures and optimized queries that keep the app's engine running strong.",
      image: '/assets/images/Lihle.png'
    },
    {
      name: 'Mpho Ramokhoase',
      role: 'Frontend',
      description: "Crafts seamless, user-friendly interfaces with an eye for responsive design and smooth interactions.",
      image: '/assets/images/Mpho.png'
    },
    {
      name: 'Nkosinathi Radebe',
      role: 'Frontend',
      description: "Brings UI designs to life with pixel-perfect precision and a deep focus on performance.",
      image: '/assets/images/IMG Nathii.jpg'
    }
  ];

  // Date for footer
  date = new Date();
  today = new Date();

  private messageInterval: any;
  private greetingInterval: any;

  constructor(private router: Router) {}

  ngOnInit() {
    // Start rotating messages
    this.messageInterval = setInterval(() => {
      this.currentMessageIndex = (this.currentMessageIndex + 1) % this.messages.length;
    }, 5000);

    // Start rotating greetings
    this.greetingInterval = setInterval(() => {
      this.currentGreetingIndex = (this.currentGreetingIndex + 1) % this.greetings.length;
    }, 3000);
  }

  ngOnDestroy() {
    if (this.messageInterval) {
      clearInterval(this.messageInterval);
    }
    if (this.greetingInterval) {
      clearInterval(this.greetingInterval);
    }
  }

  getStartedLink = '/register';

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }
}