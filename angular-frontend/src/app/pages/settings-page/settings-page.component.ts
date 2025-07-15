import { Component } from '@angular/core';
import { FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';  // Adjust path as needed

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss']
})
export class SettingsPageComponent {
  loading = false;
  settingsForm = this.fb.group({
    oldPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmNewPassword: ['', [Validators.required, this.confirmPasswordValidator]],
    receiveSms: [true],
    receiveEmail: [true]
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  confirmPasswordValidator(control: AbstractControl) {
    const newPassword = this.settingsForm.get('newPassword')?.value;
    return newPassword === control.value ? null : { mismatch: true };
  }

  async onSubmit() {
    if (this.settingsForm.invalid) return;

    this.loading = true;
    try {
      await this.auth.updateSettings(this.settingsForm.value);  // Assume this method exists in AuthService
      this.snackBar.open('Settings updated successfully!', 'Close', { duration: 3000 });
    } catch (error) {
      this.snackBar.open('Failed to update settings. Please try again.', 'Close', { duration: 3000 });
      console.error('Settings error:', error);
    } finally {
      this.loading = false;
    }
  }

  openConfirmationDialog() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Handle account deletion
        this.snackBar.open('Account deletion confirmed.', 'Close', { duration: 3000 });
        this.router.navigate(['/landing']);
      }
    });
  }

  navigateBack() {
    this.router.navigate(['/home']);
  }
}

// Simple dialog component for confirmation
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-dialog',
  template: `
    <h2 mat-dialog-title>Confirm Deletion</h2>
    <mat-dialog-content>Are you sure you want to delete your account?</mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button mat-dialog-close>No</button>
      <button mat-button color="warn" [mat-dialog-close]="true">Yes</button>
    </mat-dialog-actions>
  `
})
export class ConfirmationDialogComponent {}
