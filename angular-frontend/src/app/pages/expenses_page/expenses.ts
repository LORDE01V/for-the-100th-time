import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './expenses.html',
  styleUrl: './expenses.scss'
})
export class Expenses implements OnInit {
  // Signals for state
  expenses = signal<any[]>([]);
  loadingExpenses = signal(true);
  latestTopup = signal<any>(null);
  loadingTopup = signal(true);
  user = signal<any>(null);

  // For background image
  backgroundImageUrl: SafeUrl;

  constructor(private router: Router, private sanitizer: DomSanitizer) {
    this.backgroundImageUrl = this.sanitizer.bypassSecurityTrustUrl('assets/images/Mpho_Jesica_Create_a_high-resolution_background_image_for_a_modern_energy_man_c2363fd3-711f-41c0-b272-af8fbfd0298c.png');
  }

  ngOnInit(): void {
    // Simulate auth.getCurrentUser()
    const currentUser = { id: 1, name: 'Demo User' }; // Replace with real auth logic
    this.user.set(currentUser);

    // Simulate API calls
    this.fetchLatestTopup();
    this.fetchExpenses();
  }

  fetchLatestTopup() {
    this.loadingTopup.set(true);
    setTimeout(() => {
      // Simulate API response
      this.latestTopup.set({
        transaction_type: 'recharge',
        created_at: new Date().toISOString(),
        promo_code: 'SAVE20',
        voucher_code: '',
        amount: 250,
      });
      this.loadingTopup.set(false);
    }, 1000);
  }

  fetchExpenses() {
    this.loadingExpenses.set(true);
    setTimeout(() => {
      // Simulate API response
      this.expenses.set([
        { id: 1, category: 'Electricity', date: new Date().toISOString(), amount: 120.5, status: 'Paid' },
        { id: 2, category: 'Water', date: new Date(Date.now() - 86400000).toISOString(), amount: 80.0, status: 'Pending' },
        { id: 3, category: 'Internet', date: new Date(Date.now() - 2 * 86400000).toISOString(), amount: 60.0, status: 'Paid' },
      ]);
      this.loadingExpenses.set(false);
    }, 1000);
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  // Computed values for summary cards
  totalExpenses = computed(() =>
    this.expenses().reduce((sum, exp) => sum + exp.amount, 0)
  );
  monthlyAverage = computed(() =>
    this.expenses().length > 0
      ? this.totalExpenses() / this.expenses().length
      : 0
  );
  lastPaymentDate = computed(() =>
    this.expenses().length > 0
      ? new Date(this.expenses()[0].date).toLocaleDateString()
      : 'N/A'
  );
}