import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Location } from '@angular/common';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private history: string[] = [];

  constructor(private router: Router, private location: Location) {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Only push to history if it's not a redirect and is a distinct URL
      if (!event.urlAfterRedirects.includes('#') && 
          (this.history.length === 0 || this.history[this.history.length - 1] !== event.urlAfterRedirects)) {
        this.history.push(event.urlAfterRedirects);
      }
    });
  }

  // Method to navigate back based on history or to home
  back(): void {
    // If there's more than one entry, it means we have a history to go back through
    if (this.history.length > 1) {
      this.history.pop(); // Remove the current page from history
      const previousUrl = this.history[this.history.length - 1];

      // If the previous URL is the root or a 'home' related path, use Angular's location.back()
      // This allows normal browser back behavior within the 'home' or initial navigation flow
      if (previousUrl === '/' || previousUrl.startsWith('/home')) {
        this.location.back();
      } else {
        // For any other sub-page, always navigate to the home page.
        // This ensures the back button from a sub-page always leads to /home.
        this.router.navigate(['/home']);
      }
    } else {
      // If there's no history (e.g., first page loaded or direct access to a sub-page),
      // always navigate to the home page to ensure a safe fallback.
      this.router.navigate(['/home']);
    }
  }
}