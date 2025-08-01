import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-faultdetails',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faultdetails.html',
  styleUrl: './faultdetails.scss'
})
export class Faultdetails implements OnInit {
  panel: any = null;
  faultDetail: { details: string; measures: string[] } = { details: '', measures: [] };

  faultDescriptions: any = {
    1: {
      details: 'Panel efficiency has dropped significantly due to dirt accumulation.',
      measures: [
        'Clean the panel surface with a soft cloth and water.',
        'Ensure no shadows are cast on the panel during peak hours.',
      ],
    },
    2: {
      details: 'Panel wiring has been damaged, causing reduced power output.',
      measures: [
        'Inspect the wiring for visible damage.',
        'Replace damaged wires with new ones.',
        'Contact a certified technician for assistance.',
      ],
    },
    3: {
      details: 'Panel efficiency has dropped due to overheating.',
      measures: [
        'Ensure proper ventilation around the panel.',
        'Check for any obstructions blocking airflow.',
        'Install a cooling system if necessary.',
      ],
    },
  };

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Simulate getting navigation state (in real app, use a service or resolver)
    const nav = window.history.state;
    this.panel = nav.panel || null;

    if (this.panel && this.panel.id) {
      this.faultDetail = this.faultDescriptions[this.panel.id] || {
        details: 'No specific details available for this fault.',
        measures: ['Contact support for further assistance.'],
      };
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  goBackOne() {
    window.history.back();
  }
}