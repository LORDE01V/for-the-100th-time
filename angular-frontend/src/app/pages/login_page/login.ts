import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Import Router

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
  passwordStrengthMessage: string = ''; // Re-add password strength properties
  passwordStrengthScore: number = 0;   // Re-add password strength properties

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) { // Inject Router
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]] // Re-add minLength validator
    });
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]] // Re-add minLength validator
    });

    // Subscribe to password changes for strength checking
    this.loginForm.get('password')?.valueChanges.subscribe(password => {
      this.checkPasswordStrengthLocally(password);
    });
  }

  checkPasswordStrengthLocally(password: string) {
    if (!password) {
      this.passwordStrengthMessage = 'Password is required.';
      this.passwordStrengthScore = 0;
      return;
    }

    let score = 0;
    const criteria = [
      { regex: /[A-Z]/, points: 20, message: 'Include an uppercase letter.' },
      { regex: /[a-z]/, points: 20, message: 'Include a lowercase letter.' },
      { regex: /[0-9]/, points: 20, message: 'Include a number.' },
      { regex: /[!@#$%^&*]/, points: 20, message: 'Include a special character.' },
      { condition: password.length >= 8, points: 20, message: 'Aim for at least 8 characters.' }
    ];

    criteria.forEach(c => {
      if ('condition' in c) {
        if (c.condition) score += c.points;
      } else if ('regex' in c) {
        if (c.regex.test(password)) score += c.points;
      }
    });

    if (score === 100) {
      this.passwordStrengthMessage = 'Strong - Good job!';
    } else {
      const missingCriteria = criteria.find(c => !('condition' in c ? c.condition : c.regex && c.regex.test(password)));
      this.passwordStrengthMessage = `Weak - ${missingCriteria?.message || 'Improve your password.'}`;
    }
    this.passwordStrengthScore = score;
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm); // Re-add markFormGroupTouched
      return;
    }
    this.loading = true;
    const { email, password } = this.loginForm.value;
    this.http.post('/api/auth/login', { email, password }).subscribe({
      next: () => {
        alert('Login successful! Redirecting to home page.'); // Replace with toast if available
        this.router.navigate(['/home']); // Navigate to home page
        this.loading = false;
      },
      error: (err) => {
        let errorMessage: string;
        if (err.status === 0) { // Network error
          errorMessage = 'Cannot connect to server. Please check your internet connection.';
        } else if (err.status === 502) { // Bad Gateway
          errorMessage = 'Server is temporarily unavailable. Please try again later.';
        } else if (err?.error?.message === 'Account does not exist. Please register.') {
          errorMessage = 'Account does not exist. Please register.';
        } else {
          errorMessage = err.error?.message || 'Login failed. Please check your credentials.';
        }
        alert('Login Error: ' + errorMessage); // Replace with toast if available
        this.loading = false;
      }
    });
  }

  onResetPassword() {
    if (this.resetForm.invalid) {
      this.markFormGroupTouched(this.resetForm); // Re-add markFormGroupTouched
      return;
    }
    this.loading = true;
    const { email, newPassword } = this.resetForm.value;
    this.http.post('/api/auth/reset-password', { email, new_password: newPassword }).subscribe({
      next: () => {
        alert('Password reset successfully'); // Replace with toast if available
        this.isResetMode = false;
        this.loading = false;
      },
      error: (err) => {
        const errorMessage = err.error?.message || 'Reset failed';
        alert('Reset failed: ' + errorMessage); // Replace with toast if available
        this.loading = false;
      }
    });
  }

  handleGoogleLogin() { // Re-add handleGoogleLogin
    // This assumes your Angular app is served from the same domain as your backend
    // Or you might need to configure proxy.conf.json or adjust backendUrl
    const backendUrl = 'http://localhost:5000'; // Or your deployed backend URL
    window.location.href = `${backendUrl}/api/auth/google?action=login`;
  }

  switchToReset() {
    this.isResetMode = true;
    this.loginForm.reset(); // Re-add form reset
  }

  switchToLogin() {
    this.isResetMode = false;
    this.resetForm.reset(); // Re-add form reset
  }

  private markFormGroupTouched(formGroup: FormGroup) { // Re-add markFormGroupTouched helper
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }
}