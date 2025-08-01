import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Testimonial {
  name: string;
  quote: string;
  avatar: string;
  rating: number;
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

  testimonials: Testimonial[] = [
    { name: 'Emily Johnson', quote: 'GridX made solar simple for my family!', avatar: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167', rating: 5 },
    { name: 'Michael Smith', quote: 'Fantastic support and easy to use.', avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91', rating: 4 },
    { name: 'Jessica Brown', quote: 'I love tracking my energy savings.', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9', rating: 5 },
    { name: 'David Wilson', quote: 'Solar energy has never been easier.', avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e', rating: 5 },
    { name: 'Ashley Miller', quote: 'GridX is a game changer for my home.', avatar: 'https://images.unsplash.com/photo-1464983953574-0892a716854b', rating: 4 }
    // ...add more as needed
  ];

  // Testimonial form
  quote = '';
  name = '';
  email = '';
  rating = 0;

  // Carousel state
  currentTestimonial = 0;

  ngOnInit() {
    // Optionally, fetch testimonials from backend here
  }

  nextTestimonial() {
    this.currentTestimonial = (this.currentTestimonial + 1) % this.testimonials.length;
  }

  prevTestimonial() {
    this.currentTestimonial = (this.currentTestimonial - 1 + this.testimonials.length) % this.testimonials.length;
  }

  setRating(star: number) {
    this.rating = star;
  }

  submitTestimonial() {
    if (!this.name || !this.email || !this.quote || !this.rating) {
      alert('Please fill in all fields and select a rating.');
      return;
    }
    this.testimonials.push({
      name: this.name,
      quote: this.quote,
      avatar: 'https://via.placeholder.com/50',
      rating: this.rating
    });
    this.name = '';
    this.email = '';
    this.quote = '';
    this.rating = 0;
    alert('Thank you for your story!');
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