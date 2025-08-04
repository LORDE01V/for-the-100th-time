import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationService } from './services/navigation.service'; // Import the new service

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="app-container">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background-color: #f8fafc;
    }
  `]
})
export class AppComponent {
  title = 'GridX Solar Management';

  constructor(private navigationService: NavigationService) { // Inject the service
    // The service's constructor already handles the subscription
  }
}