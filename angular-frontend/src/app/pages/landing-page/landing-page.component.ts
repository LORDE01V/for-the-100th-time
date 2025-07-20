import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface Feature {
  icon: string;
  title: string;
  description: string;
  color: string;
}

interface TeamMember {
  name: string;
  role: string;
  avatar: string;
}

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent {
  features: Feature[] = [
    {
      icon: 'solar_power',
      title: 'Smart Energy Management',
      description: 'Optimize your power usage with AI-driven insights',
      color: '#4CAF50'
    },
    {
      icon: 'group',
      title: 'Community Power',
      description: 'Join group buying for better energy deals',
      color: '#2196F3'
    },
    {
      icon: 'savings',
      title: 'Cost Savings',
      description: 'Reduce your energy bills by up to 60%',
      color: '#FF9800'
    }
  ];

  teamMembers: TeamMember[] = [
    {
      name: 'Nkosinathi R.',
      role: 'Founder & CEO',
      avatar: 'assets/images/IMG_Nathii.jpg'
    },
    {
      name: 'Okuhle N.',
      role: 'CTO',
      avatar: 'assets/images/sleigh.png'
    },
    {
      name: 'Mpho J.',
      role: 'Energy Engineer',
      avatar: 'assets/images/Mpho.png'
    }
  ];

  constructor(private router: Router) {}

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
