import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
<<<<<<< Updated upstream

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly AUTH_KEY = 'auth_token';
  
  constructor(private router: Router) {}

  async login(credentials: { email: string; password: string }) {
    // Replace with actual API call
    const mockToken = 'mock_jwt_token';
    this.setToken(mockToken);
    this.router.navigate(['/dashboard']);
  }

  async register(userData: { name: string; email: string; password: string }) {
    // Replace with actual API call
    const mockToken = 'mock_jwt_token';
    this.setToken(mockToken);
    this.router.navigate(['/home']);
  }

  logout() {
    localStorage.removeItem(this.AUTH_KEY);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private setToken(token: string): void {
    localStorage.setItem(this.AUTH_KEY, token);
  }

  private getToken(): string | null {
    return localStorage.getItem(this.AUTH_KEY);
=======
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

interface User {
  name: string;
  email: string;
  // Add other user properties as needed
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private API_BASE_URL = 'http://localhost:5000'; // Replace with your actual backend URL

  constructor(private http: HttpClient, private router: Router) { }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/api/auth/login`, { email, password }, { withCredentials: true }).pipe(
      tap((response: any) => {
        if (response.success && response.token) {
          localStorage.setItem('token', response.token);
          // Store user details if provided in response
          if (response.user) {
            localStorage.setItem('currentUser', JSON.stringify(response.user));
          }
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        throw error; // Rethrow to be handled by the component
      })
    );
  }

  getCurrentUser(): User | null {
    if (typeof localStorage !== 'undefined') {
      const userJson = localStorage.getItem('currentUser');
      return userJson ? JSON.parse(userJson) : null;
    }
    return null;
  }

  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
    }
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    if (typeof localStorage !== 'undefined') {
      return !!localStorage.getItem('token');
    }
    return false;
  }

  // Handle Google login redirection
  handleGoogleLogin(): void {
    window.location.href = `${this.API_BASE_URL}/api/auth/google?action=login`;
  }

  // Placeholder for fetchRecommendationPlan, as it was in the original Dashboard.js
  fetchRecommendationPlan(): Observable<any> {
    // Implement actual API call if this service will handle it
    return of({ success: true, plan: { name: 'Basic Plan', description: 'Energy saving plan', price: 100, features: ['Monitoring', 'Tips'] } });
>>>>>>> Stashed changes
  }
}