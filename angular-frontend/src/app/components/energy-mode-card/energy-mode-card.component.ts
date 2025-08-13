import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-energy-mode-card',
  standalone: true, // Mark as standalone
  imports: [FormsModule, CommonModule], // Add FormsModule and CommonModule
  templateUrl: './energy-mode-card.component.html',
  styleUrls: ['./energy-mode-card.component.scss']
})
export class EnergyModeCardComponent {
  isSaverMode = true;
}
