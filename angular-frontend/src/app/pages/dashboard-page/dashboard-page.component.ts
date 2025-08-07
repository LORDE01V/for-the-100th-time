import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth.service'; // Use alias
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module'; // Use alias
import { faBatteryFull, faBolt, faFileAlt, faDotCircle } from '@fortawesome/free-solid-svg-icons';
import { ThemeService } from '@services/theme.service'; // Use alias
import { delay } from 'rxjs/operators';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

interface User {
  name: string;
  email: string;
}

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    FontAwesomeModule,
  ]
})
export class DashboardPageComponent implements OnInit {
  user: User | null = null;
  recommendationPlan: any = null;
  error: string | null = null;

  dashboardData = {
    batteryLevel: '85%',
    powerStatus: 'Stable',
    contract: {
      id: 'CNT-2025-001',
      status: 'ACTIVE',
      progress: 33,
      paymentsMade: 4,
      totalPayments: 12
    }
  };

  faBatteryFull = faBatteryFull;
  faZap = faBolt;
  faFileText = faFileAlt;
  faCircleDot = faDotCircle;

  textColor: string = '';
  bgColor: string = '';
  cardBg: string = '';
  frostedBg: string = '';
  frostedBorderColor: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private themeService: ThemeService
  ) { }

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.loadRecommendationPlan();

    this.themeService.colorMode$.subscribe((mode: 'light' | 'dark') => {
      this.cardBg = this.themeService.getColorModeValue('white', 'gray.700');
      this.textColor = this.themeService.getColorModeValue('gray.700', 'gray.200');
      this.bgColor = this.themeService.getColorModeValue('gray.50', 'gray.800');
      this.frostedBg = this.themeService.getColorModeValue('white', 'rgba(0, 0, 0, 0.6)');
      this.frostedBorderColor = this.themeService.getColorModeValue('gray.200', 'gray.600');
    });
  }

  loadRecommendationPlan(): void {
    this.authService.fetchRecommendationPlan().pipe(delay(500)).subscribe({
      next: (data: any) => {
        if (data.success) {
          this.recommendationPlan = data.plan;
        } else {
          this.error = data.message || 'No recommendation plan available';
        }
      },
      error: (err: any) => {
        this.error = err.message;
      }
    });
  }

  handleLogout(): void {
    this.authService.logout();
  }

  handleBackClick(): void {
    this.router.navigate(['/']);
  }

  handleIconClick(): void {
    this.router.navigate(['/settings']);
  }
}