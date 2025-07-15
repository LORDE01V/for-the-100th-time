import { Component } from '@angular/core';
import { jsPDF } from 'jspdf';

interface ImpactStat {
  icon: string;
  value: string;
  label: string;
  color: string;
}

@Component({
  selector: 'app-impact-page',
  templateUrl: './impact-page.component.html',
  styleUrls: ['./impact-page.component.scss']
})
export class ImpactPageComponent {
  stats: ImpactStat[] = [
    { 
      icon: 'bolt',
      value: '1.2M kWh',
      label: 'Solar Energy Generated',
      color: '#FFD700'
    },
    {
      icon: 'group',
      value: '4,300+',
      label: 'Households Empowered',
      color: '#4CAF50'
    },
    {
      icon: 'nature',
      value: '620 tons',
      label: 'CO₂ Emissions Reduced',
      color: '#2196F3'
    },
    {
      icon: 'attach_money',
      value: 'R 8.2M',
      label: 'Community Savings',
      color: '#9C27B0'
    }
  ];

  communityStories = [
    {
      name: 'Lihle M.',
      location: 'Khayelitsha',
      avatar: 'assets/images/Lihle.png',
      story: 'GridX helped us reduce our energy costs by 60%!'
    },
    {
      name: 'Kgosi T.',
      location: 'Soweto',
      avatar: 'assets/images/kg_img.png',
      story: 'Finally reliable power for my small business'
    },
    {
      name: 'Nomalanga S.',
      location: 'Alexandra',
      avatar: 'assets/images/Mpho.png',
      story: 'The group buying program made solar affordable'
    }
  ];

  downloadImpactReport() {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text('GridX Impact Report', 20, 20);
    
    // Stats
    doc.setFontSize(12);
    this.stats.forEach((stat, index) => {
      doc.text(`${stat.label}: ${stat.value}`, 20, 40 + (index * 10));
    });

    // Community Section
    doc.setFontSize(16);
    doc.text('Community Stories', 20, 90);
    this.communityStories.forEach((story, index) => {
      doc.text(`${story.name} (${story.location}): ${story.story}`, 25, 100 + (index * 15));
    });

    doc.save('gridx-impact-report.pdf');
  }
}
