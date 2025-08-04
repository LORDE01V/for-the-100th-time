import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-oauth-callback-handler',
  templateUrl: './oauth-callback-handler.html',
  styleUrls: ['./oauth-callback-handler.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class OAuthCallbackHandler implements OnInit {
  loadingMessage = 'Processing authentication...';
  errorMessage = '';
  successMessage = '';
  
  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.checkAuth();
  }

  async checkAuth() {
    // 1. Try to get user from URL param
    const params = new URLSearchParams(window.location.search);
    const userParam = params.get('user');
    if (userParam) {
      try {
        const user = JSON.parse(userParam);
        localStorage.setItem('user', JSON.stringify(user));
        this.router.navigate(['/home']);
        return;
      } catch (e) {
        // If parsing fails, continue to session check
        console.error('Failed to parse user from URL:', e);
      }
    }

    // 2. Fallback to session check
    try {
      const response: any = await this.http.get('http://localhost:5000/api/auth/user', {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }).toPromise();

      if (response && response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
        this.router.navigate(['/home']);
        return;
      }
    } catch (error) {
      // Ignore, will redirect to login below
      console.error('Auth check failed:', error);
    }

    // 3. If both fail, go to login
    this.router.navigate(['/login']);
  }
}