import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

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
  }
}