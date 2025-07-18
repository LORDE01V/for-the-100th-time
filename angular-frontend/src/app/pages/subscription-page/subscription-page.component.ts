import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-subscription-page',
  templateUrl: './subscription-page.component.html',
  styleUrls: ['./subscription-page.component.scss']
})
export class SubscriptionPageComponent {
  loading = false;
  selectedPlan: any = null;
  plans = [
    { name: 'Basic', description: 'Essential features for starters', price: '$9.99', features: ['Feature 1', 'Feature 2'] },
    { name: 'Pro', description: 'Advanced tools for power users', price: '$19.99', features: ['Feature 1', 'Feature 2', 'Feature 3'] },
    { name: 'Premium', description: 'Unlimited access and support', price: '$29.99', features: ['All features included'] }
  ];

  constructor(
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  selectPlan(plan: any) {
    this.selectedPlan = plan;
    this.snackBar.open(`You have selected the ${plan.name} plan!`, 'Close', { duration: 3000 });
  }

  async onSubscribe() {
    if (!this.selectedPlan) {
      this.snackBar.open('Please select a plan first.', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;
    try {
      // Simulate subscription logic; in a real app, call a service here
      await new Promise(resolve => setTimeout(resolve, 1000));  // Mock API call
      this.snackBar.open(`Subscribed to ${this.selectedPlan.name} successfully!`, 'Close', { duration: 3000 });
      this.router.navigate(['/home']);  // Redirect after subscription
    } catch (error) {
      this.snackBar.open('Subscription failed. Please try again.', 'Close', { duration: 3000 });
      console.error('Subscription error:', error);
    } finally {
      this.loading = false;
    }
  }

  navigateBack() {
    this.router.navigate(['/home']);
  }
}
