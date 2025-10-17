import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

interface PasswordErrors {
  oldPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
}

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.html',
  styleUrls: ['./settings-page.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class SettingsPage {
  // User view model for template (keeps lastLogin casing expected by HTML)
  user = {
    email: '',
    lastLogin: ''
  };

  // Password change state
  oldPassword = '';
  newPassword = '';
  confirmNewPassword = '';
  passwordErrors: PasswordErrors = {};
  passwordChangeLoading = false;
  passwordChangeStatus: { status: 'success' | 'error', message: string } | null = null;

  // Notification preferences
  receiveSms = true;
  receiveEmail = true;
  preferencesSaving = false;
  preferencesStatus: { status: 'success' | 'error', message: string } | null = null;

  // Delete account modal
  showDeleteModal = false;

  constructor(private apiService: ApiService, private router: Router) {
    // Initialize from local storage (fast paint)
    const current = this.apiService.getCurrentUser();
    if (current && current.email) {
      this.user.email = current.email;
    }
    // Try to fetch authoritative user (with last_login) from backend
    try {
      this.apiService.get<any>('/api/auth/user').subscribe({
        next: (res) => {
          if (res?.email) this.user.email = res.email;
          if (res?.last_login) this.user.lastLogin = res.last_login;
        },
        error: () => {
          // ignore; keep local values
        }
      });
    } catch { /* noop */ }
  }

  ngOnInit() {
    this.loadPreferences();
  }

  loadPreferences() {
    try {
      this.apiService.get<any>('/notifications/preferences').subscribe({
        next: (res) => {
          if (typeof res?.receiveSms === 'boolean') this.receiveSms = res.receiveSms;
          if (typeof res?.receiveEmail === 'boolean') this.receiveEmail = res.receiveEmail;
        },
        error: () => {
          // keep defaults
        }
      });
    } catch { /* noop */ }
  }

  // Format last login date
  formatLastLogin(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  }

  // Password change handler
  async handleChangePassword(event: Event) {
    event.preventDefault();
    this.passwordErrors = {};
    this.passwordChangeStatus = null;

    const errors: PasswordErrors = {};
    if (!this.oldPassword) errors.oldPassword = 'Old password is required';
    if (!this.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (this.newPassword.length < 6) {
      errors.newPassword = 'New password must be at least 6 characters long';
    }
    if (!this.confirmNewPassword) {
      errors.confirmNewPassword = 'Confirm new password is required';
    } else if (this.newPassword !== this.confirmNewPassword) {
      errors.confirmNewPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      this.passwordErrors = errors;
      this.passwordChangeStatus = { status: 'error', message: 'Please fix the errors above' };
      return;
    }

    this.passwordChangeLoading = true;
    try {
      const res = await this.apiService.post<any>('/api/auth/change-password', {
        old_password: this.oldPassword,
        new_password: this.newPassword
      }).toPromise();

      // Success
      this.oldPassword = '';
      this.newPassword = '';
      this.confirmNewPassword = '';
      this.passwordChangeStatus = { status: 'success', message: 'Password updated successfully.' };
    } catch (err: any) {
      const msg = err?.message || 'Password change failed';
      this.passwordChangeStatus = { status: 'error', message: msg };
    } finally {
      this.passwordChangeLoading = false;
      setTimeout(() => this.passwordChangeStatus = null, 5000);
    }
  }

  // Preferences save handler
  async handleSavePreferences() {
    this.preferencesSaving = true;
    this.preferencesStatus = null;
    try {
      const res = await this.apiService.post<any>('/notifications/preferences', {
        receiveSms: this.receiveSms,
        receiveEmail: this.receiveEmail
      }).toPromise();
      this.preferencesStatus = { status: 'success', message: 'Preferences saved successfully' };
    } catch {
      this.preferencesStatus = { status: 'error', message: 'Failed to save preferences' };
    } finally {
      this.preferencesSaving = false;
      setTimeout(() => this.preferencesStatus = null, 5000);
    }
  }

  // Delete account handler
  async handleDeleteAccount() {
    this.showDeleteModal = false;
    // Replace with real API call
    alert('Account deleted (mock). Redirecting to home...');
    window.location.href = '/';
  }

  goBack() {
    window.history.back();
  }
}