import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface CampaignMilestone {
  price: number;
  participants: number;
}

interface Campaign {
  id: number;
  product: string;
  image: string;
  originalPrice: number;
  groupPrice: number;
  goal: number;
  participants: number;
  deadline: string;
  description: string;
  timeLeft: string;
  category: string;
  milestones: CampaignMilestone[];
}

interface Testimonial {
  name: string;
  savings: string;
  text: string;
  rating: number;
  location: string;
  avatar: string;
  installationPhoto: string | null;
}

@Component({
  selector: 'app-groupbuying',
  templateUrl: './groupbuying.html',
  styleUrls: ['./groupbuying.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class Groupbuying {
  ongoingCampaigns: Campaign[] = [
    {
      id: 1,
      product: 'Solar Panel (350W)',
      image: 'assets/images/solar_panel_350w.png',
      originalPrice: 2000,
      groupPrice: 1500,
      goal: 20,
      participants: 12,
      deadline: '2024-04-30',
      description: 'High-efficiency monocrystalline solar panels perfect for residential installations.',
      timeLeft: '15 days left',
      category: 'Solar Panels',
      milestones: [
        { price: 1800, participants: 15 },
        { price: 1600, participants: 20 },
        { price: 1400, participants: 25 }
      ]
    },
    {
      id: 2,
      product: 'Inverter (5kW Hybrid)',
      image: 'assets/images/inverter__5kw_hybrid.png',
      originalPrice: 22000,
      groupPrice: 18000,
      goal: 10,
      participants: 8,
      deadline: '2024-05-15',
      description: 'Smart hybrid inverter with battery backup and grid-tie capabilities.',
      timeLeft: '30 days left',
      category: 'Inverters',
      milestones: [
        { price: 20000, participants: 5 },
        { price: 19000, participants: 7 },
        { price: 18000, participants: 10 }
      ]
    },
    {
      id: 3,
      product: 'Battery Bank (10kWh)',
      image: 'assets/images/battery_bank_10_kwh.png',
      originalPrice: 55000,
      groupPrice: 45000,
      goal: 5,
      participants: 3,
      deadline: '2024-05-01',
      description: 'Lithium-ion battery bank for reliable energy storage.',
      timeLeft: '16 days left',
      category: 'Batteries',
      milestones: [
        { price: 50000, participants: 3 },
        { price: 48000, participants: 4 },
        { price: 46000, participants: 5 }
      ]
    }
    // Add more campaigns as needed
  ];

  testimonials: Testimonial[] = [
    { name: "Lihle M.", savings: "R12,400", text: "Joined a battery campaign and saved enough to power my entire home!", rating: 5, location: "Johannesburg", avatar: "https://via.placeholder.com/50", installationPhoto: null },
    { name: "Kgosi T.", savings: "R8,200", text: "The group buying process was smooth and the support team helped with all my questions.", rating: 4.5, location: "Pretoria", avatar: "https://via.placeholder.com/50", installationPhoto: null },
    { name: "Zanele S.", savings: "R5,600", text: "Never thought solar could be this affordable until I found these group deals.", rating: 5, location: "Cape Town", avatar: "https://via.placeholder.com/50", installationPhoto: null }
  ];

  motivationalLines: string[] = [
    "Unlock exclusive savings by joining forces with other buyers!",
    "Group buying: the smart way to go solar and save big!",
    "Lower your costs, increase your impact – together we power change.",
    "Get premium solar gear at unbeatable group prices.",
    "Join a campaign and step closer to energy independence.",
    "Your next energy upgrade is more affordable with group power.",
    "Connect with fellow solar enthusiasts and save together.",
    "Every participant helps drive down the price for everyone.",
    "Don't miss out on limited-time group buying opportunities.",
    "Investing in solar is easier and cheaper in a group."
  ];

  currentLineIndex = 0;
  intervalId: any = null;

  newCampaign = {
    product: '',
    description: '',
    originalPrice: 0,
    groupPrice: 0,
    targetBuyers: 10,
    deadline: '',
    image: '',
    category: 'Solar Panels'
  };

  selectedImage: string | null = null;
  showCreateModal = false;
  referralCode = `REF-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  monthlyUsage = 500;
  selectedCampaignId = 1;
  systemSize = 5;

  ngOnInit() {
    this.intervalId = setInterval(() => {
      this.currentLineIndex = (this.currentLineIndex + 1) % this.motivationalLines.length;
    }, 7000);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  get selectedCampaign() {
    return this.ongoingCampaigns.find(c => c.id === this.selectedCampaignId);
  }

  joinCampaign(campaign: Campaign) {
    if (campaign.participants < campaign.goal) {
      campaign.participants += 1;
      alert('You have successfully joined the group buying campaign.');
    }
  }

  createCampaign() {
    if (!this.newCampaign.product || this.newCampaign.targetBuyers <= 0 || this.newCampaign.originalPrice <= 0 || !this.newCampaign.deadline || !this.selectedImage) {
      alert('Please fill in all campaign details correctly, including image.');
      return;
    }
    const newId = this.ongoingCampaigns.length + 1;
    this.ongoingCampaigns.push({
      id: newId,
      product: this.newCampaign.product,
      image: this.selectedImage,
      originalPrice: this.newCampaign.originalPrice,
      groupPrice: this.newCampaign.groupPrice,
      goal: this.newCampaign.targetBuyers,
      participants: 0,
      deadline: this.newCampaign.deadline,
      description: this.newCampaign.description,
      timeLeft: 'Just started!',
      category: this.newCampaign.category,
      milestones: []
    });
    this.showCreateModal = false;
    this.selectedImage = null;
    this.newCampaign = {
      product: '',
      description: '',
      originalPrice: 0,
      groupPrice: 0,
      targetBuyers: 10,
      deadline: '',
      image: '',
      category: 'Solar Panels'
    };
    alert('Campaign created!');
  }

  handleImageChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImage = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  copyReferralCode() {
    navigator.clipboard.writeText(this.referralCode);
    alert('Referral code copied!');
  }

  get savingsPerUnit() {
    return this.selectedCampaign ? this.selectedCampaign.originalPrice - this.selectedCampaign.groupPrice : 0;
  }

  get yearlySavings() {
    return (this.monthlyUsage * 0.95 * this.systemSize * this.savingsPerUnit) / 100;
  }
}