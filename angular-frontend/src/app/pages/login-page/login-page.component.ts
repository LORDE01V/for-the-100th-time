<<<<<<< Updated upstream
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
=======
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '@services/auth.service'; // Changed path to use alias
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
>>>>>>> Stashed changes

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
<<<<<<< Updated upstream
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent {
  loginForm: FormGroup;
  showPassword = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.errorMessage = err.error.message || 'Login failed. Please try again.';
        }
      });
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }
}
=======
  styleUrls: ['./login-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
  ]
})
export class LoginPageComponent implements OnInit {
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Check if user is already logged in
    if (this.authService.getCurrentUser()) {
      this.router.navigate(['/home']);
    }

    // Check for error parameter in URL
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['error']) {
        this.error = decodeURIComponent(params['error']);
      }
    });
  }

  async handleSubmit(): Promise<void> {
    this.loading = true;
    this.error = '';

    try {
      await this.authService.login(this.email, this.password).toPromise();
      const user = this.authService.getCurrentUser();
      if (user) {
        this.router.navigate(['/home']);
      } else {
        this.error = 'User not authenticated after login. Please try again.';
      }
    } catch (error: any) {
      this.error = 'Invalid email or password';
      console.error('Login error:', error);
    } finally {
      this.loading = false;
    }
  }

  handleGoogleLogin(): void {
    this.authService.handleGoogleLogin();
  }
}
>>>>>>> Stashed changes
