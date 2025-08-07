import { Component, OnInit, OnDestroy } from '@angular/core';
import { ThemeService } from '@services/theme.service'; // Changed path to use alias
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faSun, faMoon } from '@fortawesome/free-regular-svg-icons'; // Using regular icons for sun/moon
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common'; // Import CommonModule for ngClass/ngStyle
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'; // Import FontAwesomeModule

@Component({
  selector: 'app-theme-toggle-button',
  templateUrl: './theme-toggle-button.component.html',
  styleUrls: ['./theme-toggle-button.component.scss'],
  standalone: true, // Make standalone
  imports: [
    CommonModule, // Add CommonModule for ngClass/ngStyle
    FontAwesomeModule,
  ]
})
export class ThemeToggleButtonComponent implements OnInit, OnDestroy {
  faSun: IconDefinition = faSun;
  faMoon: IconDefinition = faMoon;
  colorMode: 'light' | 'dark' = 'light';
  private themeSubscription: Subscription = new Subscription();

  constructor(private themeService: ThemeService) { }

  ngOnInit() {
    this.themeSubscription = this.themeService.colorMode$.subscribe((mode: 'light' | 'dark') => { // Explicitly type 'mode'
      this.colorMode = mode;
    });
  }

  toggleTheme(): void {
    this.themeService.toggleColorMode();
  }

  ngOnDestroy() {
    this.themeSubscription.unsubscribe();
  }
}