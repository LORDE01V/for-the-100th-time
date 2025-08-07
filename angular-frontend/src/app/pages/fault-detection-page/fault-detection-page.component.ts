import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ThemeService } from '@services/theme.service'; // Changed path to use alias
import { CommonModule } from '@angular/common';

interface PanelData {
  id: number;
  status: string;
  efficiency: string;
}

@Component({
  selector: 'app-fault-detection-page',
  templateUrl: './fault-detection-page.component.html',
  styleUrls: ['./fault-detection-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
  ]
})
export class FaultDetectionPageComponent implements OnInit, OnDestroy {
  panelData: PanelData[] = [
    { id: 1, status: 'Operational', efficiency: '95%' },
    { id: 2, status: 'Fault Detected', efficiency: '70%' },
    { id: 3, status: 'Fault Detected', efficiency: '60%' },
  ];

  // Theme-related properties
  operationalColor: string = '';
  faultColor: string = '';
  cardBg: string = '';
  borderColor: string = '';

  private updateInterval: any;

  constructor(private router: Router, private themeService: ThemeService) { }

  ngOnInit(): void {
    this.setupThemeSubscription();
    this.startLiveUpdates();
  }

  ngOnDestroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  private setupThemeSubscription(): void {
    this.themeService.colorMode$.subscribe((mode: 'light' | 'dark') => { // Explicitly type 'mode'
      this.operationalColor = this.themeService.getColorModeValue('green.500', 'green.300');
      this.faultColor = this.themeService.getColorModeValue('red.500', 'red.300');
      this.cardBg = this.themeService.getColorModeValue('white', 'gray.800');
      this.borderColor = this.themeService.getColorModeValue('gray.200', 'gray.700');
    });
  }

  startLiveUpdates(): void {
    this.updateInterval = setInterval(() => {
      const updatedPanelData = this.panelData.map((panel) => {
        const randomEfficiency = Math.floor(Math.random() * 100) + 1;
        const randomStatus = randomEfficiency < 80 ? 'Fault Detected' : 'Operational';
        return {
          ...panel,
          efficiency: `${randomEfficiency}%`,
          status: randomStatus,
        };
      });
      this.panelData = updatedPanelData;
    }, 300000); // 5 minutes
  }

  viewMore(panel: PanelData): void {
    this.router.navigate(['/fault-details'], { state: { panel } });
  }
}