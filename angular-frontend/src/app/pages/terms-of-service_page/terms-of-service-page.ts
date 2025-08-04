import { Component } from '@angular/core';

@Component({
  selector: 'app-terms-of-service-page',
  templateUrl: './terms-of-service-page.html',
  styleUrls: ['./terms-of-service-page.scss'],
  standalone: true
})
export class TermsOfServicePage {
  // Navigation
  goBack() {
    window.history.back();
  }
}