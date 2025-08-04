import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
  // Mock user object (replace with real auth service)
  user = {
    email: 'user@example.com',
    lastLogin: new Date().toISOString()
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
      // Replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.oldPassword = '';
      this.newPassword = '';
      this.confirmNewPassword = '';
      this.passwordChangeStatus = { status: 'success', message: 'Password updated successfully' };
    } catch {
      this.passwordChangeStatus = { status: 'error', message: 'Password change failed' };
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
      // Replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1000));
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