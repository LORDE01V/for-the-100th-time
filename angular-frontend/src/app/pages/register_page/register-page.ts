import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface RegisterErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
}

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.html',
  styleUrls: ['./register-page.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule]
})
export class RegisterPage {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  phone = '';
  errors: RegisterErrors = {};
  loading = false;
  passwordStrength = '';
  strengthScore = 0;
  successMessage = '';
  errorMessage = '';

  validateForm(): boolean {
    const newErrors: RegisterErrors = {};
    if (!this.name.trim()) newErrors.name = 'Name is required';
    if (!this.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(this.email)) {
      newErrors.email = 'Email address is invalid';
    }
    if (!this.password) {
      newErrors.password = 'Password is required';
    } else if (this.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }
    if (!this.confirmPassword) {
      newErrors.confirmPassword = 'Confirm Password is required';
    } else if (this.password !== this.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    this.errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }

  checkPasswordStrengthLocally(password: string): { message: string, score: number } {
    if (!password) return { message: 'Password is required.', score: 0 };
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
    if (score === 100) return { message: 'Strong - Good job!', score };
    return { message: `Weak - ${criteria.find(c => !('condition' in c ? c.condition : c.regex && c.regex.test(password)))?.message || 'Improve your password.'}`, score };
  }

  onPasswordChange(event: Event) {
    const newPassword = (event.target as HTMLInputElement).value;
    this.password = newPassword;
    const result = this.checkPasswordStrengthLocally(newPassword);
    this.passwordStrength = result.message;
    this.strengthScore = result.score;
  }

  async onSubmit(event: Event) {
    event.preventDefault();
    this.successMessage = '';
    this.errorMessage = '';
    if (!this.validateForm()) return;
    this.loading = true;
    try {
      // Replace this with your real API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.successMessage = 'Registration Successful! You can now log in.';
      // Optionally, redirect to login page here
    } catch (error: any) {
      this.errorMessage = 'Registration failed. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  onGoogleRegister() {
    // Replace with your backend URL if needed
    const backendUrl = 'http://localhost:5000';
    window.location.href = `${backendUrl}/api/auth/google?action=register`;
  }

  goToLogin() {
    // Replace with Angular router navigation if available
    window.location.href = '/login';
  }
}