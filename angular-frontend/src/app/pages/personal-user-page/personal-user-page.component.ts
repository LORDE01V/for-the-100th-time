import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../services/api.service';
import { ConfirmationDialogComponent } from '../../components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-personal-user-page',
  templateUrl: './personal-user-page.component.html',
  styleUrls: ['./personal-user-page.component.scss']
})
export class PersonalUserPageComponent implements OnInit {
  userForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private dialog: MatDialog
  ) {
    this.userForm = this.fb.group({
      full_name: ['', Validators.required],
      surname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone_number: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      address: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.apiService.get('/api/auth/user').subscribe({
      next: (data) => {
        this.userForm.patchValue(data);
      },
      error: (err) => {
        this.errorMessage = 'Failed to load user data';
        console.error('Load error:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) return;

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirm Changes',
        message: 'Are you sure you want to update your profile?'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.saveChanges();
      }
    });
  }

  private saveChanges(): void {
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.apiService.put('/api/auth/user', this.userForm.value).subscribe({
      next: () => {
        this.successMessage = 'Profile updated successfully';
        this.isSubmitting = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Update failed. Please try again.';
        this.isSubmitting = false;
        console.error('Update error:', err);
      }
    });
  }

  get f() {
    return this.userForm.controls;
  }
}
