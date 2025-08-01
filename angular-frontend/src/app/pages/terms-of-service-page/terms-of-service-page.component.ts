import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-terms-of-service-page',
  templateUrl: './terms-of-service-page.component.html',
  styleUrls: ['./terms-of-service-page.component.scss']
})
export class TermsOfServicePageComponent {
  
  constructor(private location: Location) { }

  goBack(): void {
    this.location.back();
  }
}
