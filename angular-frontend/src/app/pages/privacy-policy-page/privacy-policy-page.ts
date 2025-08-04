import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-privacy-policy-page',
  templateUrl: './privacy-policy-page.html',
  styleUrls: ['./privacy-policy-page.scss'],
  standalone: true,
  imports: []
})
export class PrivacyPolicyPage {
  constructor(private location: Location) {}

  goBack() {
    this.location.back();
  }
}