import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

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

  constructor(private router: Router, private apiService: ApiService) {}

  ngOnInit() {
    const currentUser = this.apiService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      // Not logged in
      this.loading = false;
      this.router.navigate(['/login']);
      return;
    }
    this.user = currentUser;
    this.fetchNotifications();
  }

  fetchNotifications() {
    this.loading = true;
    const uid = this.user.id;
    this.apiService
      .get<{ notifications: any[] }>(`/api/user/notifications?user_id=${uid}`)
      .subscribe({
        next: (res) => {
          const list = res?.notifications || [];
          this.notifications = list.map(n => this.mapNotification(n));
          this.loading = false;
        },
        error: () => {
          this.notifications = [];
          this.loading = false;
        },
      });
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