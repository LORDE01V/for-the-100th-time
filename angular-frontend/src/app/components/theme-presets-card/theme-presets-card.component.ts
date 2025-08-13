import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule

@Component({
  selector: 'app-theme-presets-card',
  standalone: true, // Mark as standalone
  imports: [CommonModule], // Add CommonModule
  templateUrl: './theme-presets-card.component.html',
  styleUrls: ['./theme-presets-card.component.scss']
})
export class ThemePresetsCardComponent {
  themes = [
    { name: 'Aero Blue', color: '#B3E5FC' },
    { name: 'Warm Sunrise', color: '#FFCCBC' },
    { name: 'Warm Orange', color: '#FFE0B2' },
    { name: 'Deep Purple', color: '#D1C4E9' },
    { name: 'Eco Green', color: '#C8E6C9' },
    { name: 'Sunset Pink', color: '#F8BBD0' }
  ];
}
