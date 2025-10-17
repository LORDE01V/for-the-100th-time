import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ApiService } from '../../services/api.service';

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

  constructor(private router: Router, private sanitizer: DomSanitizer, private apiService: ApiService) {
    this.backgroundImageUrl = this.sanitizer.bypassSecurityTrustUrl('assets/images/Mpho_Jesica_Create_a_high-resolution_background_image_for_a_modern_energy_man_c2363fd3-711f-41c0-b272-af8fbfd0298c.png');
  }

  ngOnInit(): void {
    const currentUser = this.apiService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      this.loadingExpenses.set(false);
      this.loadingTopup.set(false);
      return;
    }
    this.user.set(currentUser);
    this.fetchExpenses();
  }

  fetchLatestTopup() {
    // Derive latest topup from expenses with category 'Topup'
    const topups = this.expenses().filter(e => (e.category || '').toLowerCase() === 'topup');
    if (topups.length > 0) {
      const latest = topups.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      this.latestTopup.set({
        transaction_type: 'topup',
        created_at: latest.date,
        promo_code: latest.promo_code || null,
        voucher_code: latest.voucher_code || null,
        amount: latest.amount,
      });
    } else {
      this.latestTopup.set(null);
    }
    this.loadingTopup.set(false);
  }

  fetchExpenses() {
    this.loadingExpenses.set(true);
    const current = this.user();
    this.apiService.get<{ expenses: any[] }>(`/api/user/expenses?user_id=${current.id}`).subscribe({
      next: (res) => {
        this.expenses.set((res?.expenses || []).map(e => ({
          id: e.id,
          category: e.category,
          date: e.date,
          amount: e.amount,
          status: e.status
        })));
        this.loadingExpenses.set(false);
        // After expenses are loaded, derive latest topup
        this.loadingTopup.set(true);
        this.fetchLatestTopup();
      },
      error: () => {
        this.expenses.set([]);
        this.loadingExpenses.set(false);
        this.loadingTopup.set(false);
      }
    });
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