import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class Login {
  loginForm: FormGroup;
  resetForm: FormGroup;
  isResetMode = false;
  loading = false;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      newPassword: ['', Validators.required]
    });
  }

  onLogin() {
    if (this.loginForm.invalid) return;
    this.loading = true;
    const { email, password } = this.loginForm.value;
    this.http.post('/api/auth/login', { email, password }).subscribe({
      next: () => {
        alert('Login successful!');
        // TODO: handle navigation or state update
        this.loading = false;
      },
      error: (err) => {
        if (err?.error?.message === 'Account does not exist. Please register.') {
          alert('Account does not exist. Please register.');
          // TODO: Optionally, navigate to register page
        } else {
          alert('Login failed. Please check your credentials.');
        }
        this.loading = false;
      }
    });
  }

  onResetPassword() {
    if (this.resetForm.invalid) return;
    this.loading = true;
    const { email, newPassword } = this.resetForm.value;
    this.http.post('/api/auth/reset-password', { email, new_password: newPassword }).subscribe({
      next: () => {
        alert('Password reset successfully');
        this.isResetMode = false;
        this.loading = false;
      },
      error: () => {
        alert('Reset failed');
        this.loading = false;
      }
    });
  }

  switchToReset() {
    this.isResetMode = true;
  }

  switchToLogin() {
    this.isResetMode = false;
  }
}