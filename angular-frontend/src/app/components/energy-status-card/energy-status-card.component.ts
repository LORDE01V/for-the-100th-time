import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule

@Component({
  selector: 'app-energy-status-card',
  standalone: true, // Mark as standalone
  imports: [CommonModule], // Add CommonModule
  templateUrl: './energy-status-card.component.html',
  styleUrls: ['./energy-status-card.component.scss']
})
export class EnergyStatusCardComponent {
  usage = 85;
}
