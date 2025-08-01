import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface Notification {
  id: number;
  status: 'warning' | 'info' | 'success' | 'error';
  title: string;
  description: string;
  isDismissed: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-notifications-page',
  templateUrl: './notifications-page.component.html',
  styleUrls: ['./notifications-page.component.scss']
})
export class NotificationsPageComponent implements OnInit {
  notifications: Notification[] = [
    {
      id: 1,
      status: 'warning',
      title: 'Low Balance',
      description: 'Your energy credit is running low. Top up soon!',
      isDismissed: false,
      timestamp: new Date('2024-03-20T09:30:00')
    },
    {
      id: 2,
      status: 'info',
      title: 'System Update',
      description: 'Scheduled maintenance tonight at 2 AM.',
      isDismissed: false,
      timestamp: new Date('2024-03-20T10:15:00')
    },
    {
      id: 3,
      status: 'success',
      title: 'Top-Up Successful',
      description: 'Your R200 top-up was successful.',
      isDismissed: false,
      timestamp: new Date('2024-03-19T14:45:00')
    },
    {
      id: 4,
      status: 'error',
      title: 'Payment Failed',
      description: 'Your recent payment failed. Please check your details.',
      isDismissed: false,
      timestamp: new Date('2024-03-19T16:20:00')
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
    }
  }

  dismissNotification(notificationId: number): void {
    this.notifications = this.notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, isDismissed: true }
        : notification
    );
  }

  getStatusColor(status: string): string {
    const colors = {
      warning: '#ffc107',
      info: '#17a2b8',
      success: '#28a745',
      error: '#dc3545'
    };
    return colors[status as keyof typeof colors] || '#6c757d';
  }

  get visibleNotifications() {
    return this.notifications.filter(n => !n.isDismissed);
  }
}
