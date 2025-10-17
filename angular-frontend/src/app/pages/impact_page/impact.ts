import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

interface Story {
  id: number;
  name: string;
  quote: string;
  rating: number;
  user_avatar: string;
  created_at: string;
}

@Component({
  selector: 'app-impact',
  templateUrl: './impact.html',
  styleUrls: ['./impact.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule]
})
export class Impact implements OnInit {
  impactStats = [
    { label: 'Total Solar Energy Provided', value: '1.2M kWh saved', icon: 'solar_power' },
    { label: 'Households Served', value: '4,300+ families empowered', icon: 'groups' },
    { label: 'CO₂ Emissions Reduced', value: '620 tons offset', icon: 'eco' }
  ];

  stories: Story[] = [];
  currentStoryIndex = 0;
  loading = true;
  error: string | null = null;

  // Form fields
  name = '';
  email = '';
  quote = '';
  rating = 0;

  constructor(private apiService: ApiService) {}

  async ngOnInit() {
    await this.loadStories();
  }

  async loadStories() {
    this.loading = true;
    this.error = null;
    try {
      this.stories = await this.apiService.get<Story[]>('/stories').toPromise() || [];
      this.loading = false;
    } catch (err) {
      console.error('Failed to load stories:', err);
      this.error = 'Failed to load stories. Please try again later.';
      this.loading = false;
    }
  }

  nextStory() {
    if (this.currentStoryIndex < this.stories.length - 1) {
      this.currentStoryIndex++;
    }
  }

  prevStory() {
    if (this.currentStoryIndex > 0) {
      this.currentStoryIndex--;
    }
  }

  setRating(star: number) {
    this.rating = star;
  }

  async submitTestimonial() {
    if (!this.name || !this.email || !this.quote || !this.rating) {
      alert('Please fill in all fields and select a rating.');
      return;
    }

    try {
      const response = await this.apiService.post<any>('/stories', {
        name: this.name,
        email: this.email,
        quote: this.quote,
        rating: this.rating
      }).toPromise();

      alert('Thank you for your story! ' + 
           (response?.needs_approval ? 'Your story is pending approval.' : 'Your story is now live!'));
      
      // Reset form
      this.name = '';
      this.email = '';
      this.quote = '';
      this.rating = 0;

      // Refresh stories
      await this.loadStories();
    } catch (err) {
      console.error('Failed to submit story:', err);
      alert('Failed to submit your story. Please try again.');
    }
  }

  downloadPDF() {
    // Simple PDF download using jsPDF (must be installed and imported if you want real PDF)
    const text = [
      'Gridx Impact Report',
      '',
      'Total Solar Energy Provided: 1.2M kWh saved',
      'Households Served: 4,300+ families empowered',
      'CO₂ Emissions Reduced: 620 tons offset'
    ].join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'impact_report.txt';
    link.click();
  }
}