import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-person-user-page',
  templateUrl: './person-user-page.html',
  styleUrls: ['./person-user-page.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class PersonUserPage implements OnInit {
  profileForm: FormGroup;
  isDialogOpen = false;
  dialogMessage = '';
  loading = false;
  toast: { type: 'success' | 'error', message: string } | null = null;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.profileForm = this.fb.group({
      full_name: ['', Validators.required],
      surname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone_number: [''],
      address: ['']
    });
  }

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.toast = { type: 'error', message: 'No authentication token found.' };
      return;
    }
    this.loading = true;
    this.http.get<any>('http://localhost:5000/profile/me', {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
    }).subscribe({
      next: (data) => {
        this.profileForm.patchValue(data);
        this.loading = false;
      },
      error: () => {
        this.toast = { type: 'error', message: 'Failed to load user data' };
        this.loading = false;
      }
    });
  }

  onSubmit() {
    if (this.profileForm.invalid) return;
    this.dialogMessage = 'Are you sure you want to save these changes to your profile?';
    this.isDialogOpen = true;
  }

  confirmSubmit() {
    this.isDialogOpen = false;
    const token = localStorage.getItem('token');
    if (!token) {
      this.toast = { type: 'error', message: 'No authentication token found.' };
      return;
    }
    this.loading = true;
    this.http.post('http://localhost:5000/profile/me', this.profileForm.value, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
    }).subscribe({
      next: () => {
        this.toast = { type: 'success', message: 'Profile updated successfully' };
        this.loading = false;
      },
      error: (error) => {
        this.toast = {
          type: 'error',
          message: error?.error?.message || 'Update failed'
        };
        this.loading = false;
      }
    });
  }

  closeDialog() {
    this.isDialogOpen = false;
  }

  closeToast() {
    this.toast = null;
  }
}