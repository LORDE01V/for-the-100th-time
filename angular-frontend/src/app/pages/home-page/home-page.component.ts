import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface Statistic {
  icon: string;
  value: string;
  label: string;
}

interface QuickAction {
  title: string;
  icon: string;
  route: string;
  color: string;
}

interface EnergyMode {
  name: string;
  active: boolean;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent {
  statistics: Statistic[] = [
    { icon: 'bolt', value: '85%', label: 'Current Efficiency' },
    { icon: 'savings', value: 'R 1.2k', label: 'Monthly Savings' },
    { icon: 'solar_power', value: '4.8kW', label: 'Solar Output' },
    { icon: 'battery_full', value: '68%', label: 'Battery Level' }
  ];

  quickActions: QuickAction[] = [
    { title: 'Energy Analysis', icon: 'analytics', route: '/analysis', color: '#4CAF50' },
    { title: 'Group Buying', icon: 'group', route: '/group-buying', color: '#2196F3' },
    { title: 'AI Suggestions', icon: 'smart_toy', route: '/ai-suggestions', color: '#9C27B0' },
    { title: 'Load Shedding', icon: 'flash_off', route: '/load-shedding', color: '#FF9800' }
  ];

  energyModes: EnergyMode[] = [
    { 
      name: 'Eco Mode',
      active: true,
      icon: 'eco',
      description: 'Optimized for energy savings'
    },
    {
      name: 'Performance',
      active: false,
      icon: 'speed',
      description: 'Maximum power output'
    },
    {
      name: 'Backup',
      active: false,
      icon: 'battery_alert',
      description: 'Preserve battery capacity'
    }
  ];

  activityFeed = [
    { time: '10:30 AM', message: 'Solar production peak reached: 4.8kW' },
    { time: '9:15 AM', message: 'New energy saving suggestion available' },
    { time: 'Yesterday', message: 'Joined group buying campaign for solar panels' }
  ];

  constructor(private router: Router) {}

  toggleEnergyMode(mode: EnergyMode) {
    this.energyModes.forEach(m => m.active = m === mode);
  }

  handleQuickAction(action: QuickAction) {
    this.router.navigate([action.route]);
  }
}
