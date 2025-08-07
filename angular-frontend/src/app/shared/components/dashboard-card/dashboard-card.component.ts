import { Component, Input, OnInit } from '@angular/core';
import { DashboardService } from '../../../services/dashboard.service';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'; // Import IconDefinition

@Component({
  selector: 'app-dashboard-card',
  templateUrl: './dashboard-card.component.html',
  styleUrls: ['./dashboard-card.component.scss']
})
export class DashboardCardComponent implements OnInit {
  @Input() isHighlighted: boolean = false;
  @Input() title: string = '';
  @Input() icon: IconDefinition | undefined; // Use IconDefinition type
  @Input() metric: string = '';
  @Input() metricLabel: string = '';
  @Input() footer: any; // Content to be projected into the footer slot
  @Input() bg: string = '';
  @Input() bgGradient: string = '';
  @Input() planDetails: string = '';
  @Input() iconColor: string = 'blue.500';

  cardBg: string = 'white';
  borderColor: string = 'gray.200';
  textColor: string = 'gray.600';

  effectiveBoxShadow: string = 'xl';
  effectiveBorderColor: string = 'gray.200';

  currentThemeConfig: any;

  constructor(private dashboardService: DashboardService) { }

  ngOnInit() {
    this.dashboardService.currentThemeConfig$.subscribe(config => {
      this.currentThemeConfig = config;
      const isDarkMode = document.body.classList.contains('chakra-ui-dark');
      this.cardBg = isDarkMode ? 'gray.800' : 'white';
      this.borderColor = isDarkMode ? 'gray.700' : 'gray.200';
      this.textColor = isDarkMode ? 'gray.400' : 'gray.600';

      this.effectiveBoxShadow = this.isHighlighted ? 'outline' : 'xl';
      this.effectiveBorderColor = this.isHighlighted ? 'green.400' : this.borderColor;
    });
  }
}