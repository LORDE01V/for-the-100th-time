import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface NavItem {
  icon: string;
  title: string;
  path: string;
  description: string;
  color: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class Home implements OnInit, OnDestroy {
  user = { name: 'Valued User' }; // Replace with actual auth logic
  navItems: NavItem[] = [
    { icon: 'solar_power', title: 'Dashboard', path: '/dashboard', description: 'View your power usage and financial summary', color: 'blue' },
    { icon: 'person', title: 'Profile Details', path: '/personal-user', description: 'Update your personal information', color: 'blue' },
    { icon: 'battery_charging_full', title: 'Top Up', path: '/top-up', description: 'Add credit to your power account', color: 'green' },
    { icon: 'account_balance_wallet', title: 'Expenses', path: '/expenses', description: 'Track your power expenses', color: 'purple' },
    { icon: 'notifications', title: 'Notifications', path: '/notifications', description: 'View your alerts and updates', color: 'orange' },
    { icon: 'settings', title: 'Settings', path: '/settings', description: 'Customize your preferences', color: 'gray' },
    { icon: 'eco', title: 'Impact', path: '/impact', description: 'See your environmental impact', color: 'teal' },
    { icon: 'support_agent', title: 'Support', path: '/support', description: 'Get help and find answers', color: 'blue' },
    { icon: 'smart_toy', title: 'AI Suggestions', path: '/ai-suggestions', description: 'Get smart tips from our AI to save energy and manage finances', color: 'purple' },
    { icon: 'forum', title: 'Forum', path: '/forum', description: 'Join the community discussion', color: 'purple' },
    { icon: 'group_add', title: 'Refer & Earn', path: '/refer', description: 'Invite friends and get rewards', color: 'orange' },
    { icon: 'subscriptions', title: 'Subscriptions', path: '/subscription', description: 'Manage your energy subscription plans', color: 'blue' },
    { icon: 'groups', title: 'Group Buying', path: '/group-buying', description: 'Join or create group solar purchases and save', color: 'purple' }
  ];
  solarTips: string[] = [
    'Consider running high-consumption appliances during peak sunlight hours.',
    'Your battery storage is optimized for evening usage patterns.',
    'Opening curtains can reduce lighting costs by up to 30%.',
    'Current weather patterns suggest ideal solar generation today.'
  ];
  currentTipIndex = 0;
  aiGreeting: string | null = null;
  isLoadingGreeting = true;
  greetingError = false;
  email = '';
  intervalId: any = null;
  date = new Date();
  today = new Date();

  ngOnInit() {
    this.setGreeting();
    this.intervalId = setInterval(() => {
      this.currentTipIndex = (this.currentTipIndex + 1) % this.solarTips.length;
      this.setGreeting();
    }, 5000);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  setGreeting() {
    this.isLoadingGreeting = true;
    setTimeout(() => {
      this.aiGreeting = `🌞 Good ${this.getTimeOfDay()}, ${this.user.name}! Here's your personalized energy tip: ${this.solarTips[this.currentTipIndex]}`;
      this.isLoadingGreeting = false;
      this.greetingError = false;
    }, 800);
  }

  getTimeOfDay() {
    const hour = new Date().getHours();
    return hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  }

  handleLogout() {
    // Replace with actual logout logic
    alert('Logged out!');
    // Redirect to login page
    window.location.href = '/login';
  }

  subscribeNewsletter() {
    if (this.email.includes('@')) {
      alert('Subscribed! Check your inbox.');
      this.email = '';
    } else {
      alert('Please enter a valid email.');
    }
  }
}
