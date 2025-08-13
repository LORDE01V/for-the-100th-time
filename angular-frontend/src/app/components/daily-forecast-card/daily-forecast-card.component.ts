import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule

@Component({
  selector: 'app-daily-forecast-card',
  standalone: true, // Mark as standalone
  imports: [CommonModule], // Add CommonModule
  templateUrl: './daily-forecast-card.component.html',
  styleUrls: ['./daily-forecast-card.component.scss']
})
export class DailyForecastCardComponent {}
