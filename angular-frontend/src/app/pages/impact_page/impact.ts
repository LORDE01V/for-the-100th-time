import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { firstValueFrom } from 'rxjs';

interface Story {
  id: number;
  name: string;
  quote: string;
  rating: number;
  user_avatar: string | null;
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
      const raw = await firstValueFrom(
        this.apiService.get<any[]>('/api/community-stories')
      );
      const mapped = (raw ?? []).map((s: any, idx: number) => {
        const name = s.user_name || s.name || 'Community Member';
        return {
          id: s.id ?? idx,
          name,
          quote: s.story_text ?? s.quote ?? '',
          rating: s.rating ?? 0,
          user_avatar: s.user_avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
          created_at: s.created_at ?? new Date().toISOString()
        } as Story;
      });
      this.stories = mapped;
      this.currentStoryIndex = 0;
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
      await firstValueFrom(
        this.apiService.post<any>('/api/community-stories', {
          user_name: this.name,
          story_text: this.quote,
          rating: this.rating
        })
      );
      alert('Thank you for your story!');
      await this.loadStories();

      // Reset form
      this.name = '';
      this.email = '';
      this.quote = '';
      this.rating = 0;
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