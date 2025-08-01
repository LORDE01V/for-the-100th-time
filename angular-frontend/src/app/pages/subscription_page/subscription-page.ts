import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  description: string;
}

interface PlanRationale {
  isLoading: boolean;
  message: string;
}

@Component({
  selector: 'app-subscription-page',
  templateUrl: './subscription-page.html',
  styleUrls: ['./subscription-page.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class SubscriptionPage implements OnInit {
  selectedPlans: string[] = [];
  rationale: { [key: string]: PlanRationale } = {};

  subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'basic-lite',
      name: 'Basic Lite',
      price: 29,
      features: [
        'Limited access to core features',
        'Basic energy tracking',
        'Standard email support'
      ],
      description: 'Ideal for newcomers, this plan offers a simple introduction to energy management with easy-to-use tools and community tips.'
    },
    {
      id: 'basic',
      name: 'Basic',
      price: 49,
      features: [
        'Access to core features',
        'Basic energy usage tracking',
        'Email support'
      ],
      description: 'A solid starting point for everyday users, focusing on reliable tracking and essential tools for home energy optimization.'
    },
    {
      id: 'basic-plus',
      name: 'Basic Plus',
      price: 69,
      features: [
        'All Basic features',
        'Enhanced tracking reports',
        'Priority email support'
      ],
      description: 'Step up with advanced reports and priority support, perfect for users looking to dive deeper into their energy habits.'
    },
    {
      id: 'standard-lite',
      name: 'Standard Lite',
      price: 79,
      features: [
        'Most Standard features',
        'Basic analytics',
        'Email and chat support',
        'Standard notifications'
      ],
      description: 'A balanced plan for moderate users, including analytics and notifications to help manage energy more efficiently.'
    },
    {
      id: 'standard',
      name: 'Standard',
      price: 99,
      features: [
        'All Basic features',
        'Detailed analytics & reports',
        'Priority email & chat support',
        'Load shedding notifications'
      ],
      description: 'Comprehensive analytics for proactive energy management, with real-time notifications to stay ahead of usage.'
    },
    {
      id: 'standard-plus',
      name: 'Standard Plus',
      price: 119,
      features: [
        'All Standard features',
        'Advanced reports',
        '24/7 support',
        'Enhanced notifications'
      ],
      description: 'Elevate your experience with 24/7 support and advanced tools, ideal for families or small businesses.'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 149,
      features: [
        'All Standard features',
        'Real-time energy monitoring',
        'Dedicated account manager',
        'Early access to new features',
        'VIP support'
      ],
      description: ''
    },
    {
      id: 'premium-plus',
      name: 'Premium Plus',
      price: 309,
      features: [
        'All Premium features',
        'Enhanced real-time monitoring',
        'Dedicated manager',
        'VIP access and support'
      ],
      description: 'Unlock dedicated support and real-time insights, tailored for users who demand the best in energy solutions.'
    }
  ];

  mockRationaleMessages = [
    "This plan suits your low energy usage pattern based on mock data analysis.",
    "Based on your data, this is a great match for high efficiency needs.",
    "Ideal for users with moderate usage; it optimizes costs effectively.",
    "This option aligns well with your peak-hour energy patterns.",
    "Perfect for solar-dependent setups like yours.",
    "Enhances your energy tracking with minimal investment.",
    "A smart choice for reducing your carbon footprint.",
    "Tailored for users seeking reliable load shedding solutions.",
    "Boosts your energy management with advanced features.",
    "Great for everyday efficiency and cost savings.",
    "This plan fits users with variable energy demands.",
    "Optimizes for low-usage scenarios to save more.",
    "Balances cost and features for your energy profile.",
    "Supports real-time monitoring for better decisions.",
    "Ideal if you're focusing on sustainable energy sources.",
    "Provides excellent value for high-usage households.",
    "Enhances notifications for proactive energy management.",
    "A solid pick for users prioritizing 24/7 support.",
    "Matches your needs for detailed analytics reports.",
    "Streamlines your energy optimization efforts.",
    "Best for those with growing energy requirements.",
    "Delivers premium insights at an affordable rate.",
    "Adapts to your energy habits for maximum efficiency.",
    "Unlocks advanced tools for energy conservation.",
    "Suited for users with solar and grid hybrid systems.",
    "Offers robust features for budget-conscious users.",
    "Elevates your setup with priority support options.",
    "Tailored for peak performance in energy tracking.",
    "A versatile plan for mixed energy usage patterns.",
    "Focuses on cost-effective solutions for you.",
    "Integrates well with your current energy setup.",
    "Provides comprehensive monitoring for better savings.",
    "Ideal for users expanding their energy systems.",
    "Enhances your experience with real-time data insights.",
    "Perfect match for low-maintenance energy needs.",
    "Boosts efficiency for users with high demands.",
    "Supports your goals for sustainable living.",
    "A reliable choice for everyday energy challenges.",
    "Optimizes for users with fluctuating usage.",
    "Delivers value through advanced reporting features.",
    "Great for those seeking customizable energy plans.",
    "Aligns with your profile for optimal energy use.",
    "Enhances control over your energy consumption.",
    "Tailored to handle your specific energy patterns.",
    "Provides a strong foundation for energy management.",
    "Ideal for proactive users monitoring their usage.",
    "Balances features and cost for your needs.",
    "Unlocks potential savings with smart analytics.",
    "Suited for dynamic energy environments.",
    "Offers premium support for peace of mind.",
    "A top pick for efficient and eco-friendly options."
  ];

  ngOnInit() {
    const savedPlans = localStorage.getItem('selectedPlans');
    if (savedPlans) {
      this.selectedPlans = JSON.parse(savedPlans);
    }
    
    // Initialize rationale for all plans
    this.subscriptionPlans.forEach(plan => {
      this.rationale[plan.id] = { isLoading: false, message: '' };
    });
  }

  handleSelectPlan(plan: SubscriptionPlan) {
    // Replace with your real subscription service
    console.log('Selected plan:', plan);
    window.location.href = '/dashboard';
  }

  async fetchPlanRationale(planId: string) {
    if (this.rationale[planId]?.isLoading) return;

    this.rationale[planId] = { isLoading: true, message: '' };

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const randomMessage = this.mockRationaleMessages[
        Math.floor(Math.random() * this.mockRationaleMessages.length)
      ];
      
      this.rationale[planId] = { isLoading: false, message: randomMessage };
    } catch (error) {
      this.rationale[planId] = { isLoading: false, message: 'Unable to fetch rationale at this time.' };
    }
  }

  getPlanIcon(planId: string): string {
    if (planId.includes('basic')) return '⚡';
    if (planId.includes('standard')) return '☀️';
    if (planId.includes('premium')) return '🛡️';
    return '📊';
  }

  goBack() {
    window.history.back();
  }
}