import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Notification {
  id: number;
  status: 'info' | 'success' | 'warning' | 'error';
  title: string;
  description: string;
  isDismissed: boolean;
  created_at: string;
}

@Component({
  selector: 'app-notifications-page',
  templateUrl: './notifications-page.html',
  styleUrls: ['./notifications-page.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class NotificationsPage implements OnInit {
  notifications: Notification[] = [];
  loading = true;
  user: any = null;

  constructor(private router: Router) {}

  ngOnInit() {
    // Replace with your actual auth service logic
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      alert('Please log in to access this page');
      this.router.navigate(['/login']);
      return;
    }
    this.user = JSON.parse(userStr);

    this.fetchNotifications();
  }

  fetchNotifications() {
    this.loading = true;
    // Assuming you have an API endpoint for notifications, e.g., /api/user/notifications
    // This part needs to be implemented based on your backend
    // For now, we'll simulate a response
    setTimeout(() => {
      this.notifications = [
        { id: 1, status: 'info', title: 'Welcome Back!', description: 'Welcome back to your account.', isDismissed: false, created_at: '2023-10-27T10:00:00Z' },
        { id: 2, status: 'success', title: 'Transaction Successful', description: 'Your recent transaction of $120.00 was successful.', isDismissed: false, created_at: '2023-10-27T09:30:00Z' },
        { id: 3, status: 'warning', title: 'Low Balance', description: 'Your account balance is low. Please top up.', isDismissed: false, created_at: '2023-10-27T08:00:00Z' },
        { id: 4, status: 'error', title: 'Login Failed', description: 'Your last login attempt failed. Please try again.', isDismissed: false, created_at: '2023-10-27T07:00:00Z' },
      ];
      this.loading = false;
    }, 1000); // Simulate an API call
  }

  mapNotification(notif: any): Notification {
    const message = (notif.message || '').toLowerCase();
    let status: Notification['status'] = 'info';
    if (message.includes('expense') || message.includes('success') || message.includes('top-up')) {
      status = 'success';
    } else if (message.includes('low balance')) {
      status = 'warning';
    } else if (message.includes('failed')) {
      status = 'error';
    }
    return {
      id: notif.id,
      status,
      title: notif.title || 'New Notification',
      description: notif.message,
      isDismissed: notif.isDismissed || false,
      created_at: notif.created_at,
    };
  }

  handleDismissNotification(id: number) {
    this.notifications = this.notifications.map(notif =>
      notif.id === id ? { ...notif, isDismissed: true } : notif
    );
    // Optionally, call an API to persist dismissal
  }

  get activeNotifications() {
    return this.notifications.filter(notif => !notif.isDismissed);
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}