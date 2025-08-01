import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-top-up-page',
  templateUrl: './top-up-page.component.html',
  styleUrls: ['./top-up-page.component.scss']
})
export class TopUpPageComponent implements OnInit {
  topUpForm: FormGroup;
  currentBalance = 150.50;
  paymentMethods = ['Credit Card', 'PayPal', 'Bank Transfer'];
  isLoading = false;
  isProcessing = false;

  constructor(
    private fb: FormBuilder,
    private location: Location,
    private snackBar: MatSnackBar,
    private auth: AuthService,
    private api: ApiService
  ) {
    this.topUpForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(10)]],
      promoCode: [''],
      paymentMethod: ['', Validators.required]
    });
  }

  ngOnInit() {
    if (!this.auth.currentUser) {
      this.location.replaceState('/login');
    }
  }

  async submitTopUp() {
    if (this.topUpForm.invalid) return;

    this.isProcessing = true;
    try {
      const response = await this.api.topUpBalance(this.topUpForm.value);
      this.snackBar.open('Top-up successful!', 'Close', { duration: 3000 });
      this.currentBalance += this.topUpForm.value.amount;
      this.topUpForm.reset();
    } catch (error) {
      this.snackBar.open('Top-up failed. Please try again.', 'Close', { duration: 3000 });
    } finally {
      this.isProcessing = false;
    }
  }

  goBack() {
    this.location.back();
  }
}
