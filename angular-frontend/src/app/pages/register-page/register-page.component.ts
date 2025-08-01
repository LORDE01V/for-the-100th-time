import { Component } from '@angular/core';
import { FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss']
})
export class RegisterPageComponent {
  loading = false;
  showPassword = false;
  passwordStrength = '';
  strengthScore = 0;

  registerForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    password: ['', [
      Validators.required,
      Validators.minLength(8),
      this.passwordStrengthValidator
    ]],
    confirmPassword: ['', [Validators.required, this.confirmPasswordValidator]]
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  passwordStrengthValidator(control: AbstractControl) {
    const value = control.value || '';
    let score = 0;
    
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/\d/.test(value)) score++;
    if (/[!@#$%^&*]/.test(value)) score++;

    control.parent?.get('strengthScore')?.setValue(score);
    return null;
  }

  confirmPasswordValidator(control: AbstractControl) {
    const password = control.parent?.get('password')?.value;
    return password === control.value ? null : { mismatch: true };
  }

  getStrengthColor(score: number): string {
    if (score >= 4) return 'primary';
    if (score >= 2) return 'accent';
    return 'warn';
  }

  async onSubmit() {
    if (this.registerForm.invalid) return;

    this.loading = true;
    try {
      await this.auth.register(this.registerForm.value);
      this.snackBar.open('Registration successful!', 'Close', { duration: 3000 });
      this.router.navigate(['/login']);
    } catch (error) {
      this.snackBar.open('Registration failed. Please try again.', 'Close', { duration: 3000 });
      console.error('Registration error:', error);
    } finally {
      this.loading = false;
    }
  }

  navigateBack() {
    this.router.navigate(['/landing']);
  }

  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
}
