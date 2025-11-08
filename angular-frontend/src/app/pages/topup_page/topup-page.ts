import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-topup-page',
  templateUrl: './topup-page.html',
  styleUrls: ['./topup-page.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class TopupPage implements OnInit {

  // Form state
  balance = 'R0.00';
  amount = '';
  promoCode = '';
  voucherCode = '';
  isProcessing = false;
  transactionType = 'topup';

  // Auto top-up state
  isAutoTopUpEnabled = false;
  minBalance = '';
  autoTopUpAmount = '';
  autoTopUpFrequency = 'weekly';

  // Modal state
  showAutoTopUpModal = false;

  // Status messages
  statusMessage: { type: 'success' | 'error' | 'warning', message: string } | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.fetchBalance();
    this.fetchAutoTopUpSettings();
  }

  // Navigation
  goBack() {
    window.location.href = '/home';
  }

  // Fetch balance from API
  async fetchBalance() {
    try {
      // If you have an endpoint to fetch balance, call it here.
      // For now, keep the current value until topup response updates it.
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  }

  // Fetch auto top-up settings
  async fetchAutoTopUpSettings() {
    try {
      const userId = await this.resolveUserId();
      if (!userId) return;

      const response = await firstValueFrom(
        this.apiService.get<any>(`/api/user/auto-topup-settings?user_id=${userId}`)
      );

      if (response) {
        this.isAutoTopUpEnabled = !!response.is_auto_topup;

        if (response.min_balance !== undefined && response.min_balance !== null) {
          const parsedMinBalance = Number(response.min_balance);
          this.minBalance = !isNaN(parsedMinBalance)
            ? parsedMinBalance.toFixed(2)
            : `${response.min_balance}`;
        }

        if (response.auto_topup_amount !== undefined && response.auto_topup_amount !== null) {
          const parsedAutoAmount = Number(response.auto_topup_amount);
          this.autoTopUpAmount = !isNaN(parsedAutoAmount)
            ? parsedAutoAmount.toFixed(2)
            : `${response.auto_topup_amount}`;
        }

        if (response.auto_topup_frequency) {
          this.autoTopUpFrequency = response.auto_topup_frequency;
        }
      }
    } catch (err) {
      console.error('Error fetching auto top-up settings:', err);
    }
  }

  // Handle top-up submission
  async handleTopUp(event: Event) {
    event.preventDefault();
    
    const topUpAmount = parseFloat(this.amount);
    if (isNaN(topUpAmount) || topUpAmount <= 0) {
      this.showStatus('warning', 'Please enter a valid positive amount.');
      return;
    }

    this.isProcessing = true;
    this.statusMessage = null;

    try {
      const userId = await this.resolveUserId();
      if (!userId) {
        this.showStatus('error', 'You must be logged in to top up.');
        return;
      }
      const payload = {
        user_id: userId,
        amount: topUpAmount,
        promo_code: this.promoCode || null,
        voucher_code: this.voucherCode || null,
      };
      const res = await firstValueFrom(this.apiService.post<any>('/api/topup', payload));
      if (res?.success) {
        const nb = typeof res.newBalance === 'number' ? res.newBalance : parseFloat(res.newBalance);
        if (!isNaN(nb)) {
          this.balance = `R${nb.toFixed(2)}`;
        }
        this.showStatus('success', 'Top-up successful!');
      } else {
        this.showStatus('error', res?.message || 'Payment failed. Please try again.');
      }
      
      // Clear form
      this.amount = '';
      this.promoCode = '';
      this.voucherCode = '';
    } catch (error) {
      this.showStatus('error', 'Payment failed. Please try again.');
    } finally {
      this.isProcessing = false;
    }
  }

  // Handle auto top-up save
  async handleAutoTopUpSave() {
    if (!this.minBalance || !this.autoTopUpAmount) {
      this.showStatus('warning', 'Please fill in all required fields for Auto Top-Up.');
      return;
    }

    const minBalanceValue = parseFloat(this.minBalance);
    const autoTopUpAmountValue = parseFloat(this.autoTopUpAmount);
    if (isNaN(minBalanceValue) || minBalanceValue < 0 || isNaN(autoTopUpAmountValue) || autoTopUpAmountValue <= 0) {
      this.showStatus('warning', 'Please provide valid numeric values for minimum balance and auto top-up amount.');
      return;
    }

    this.isProcessing = true;
    this.statusMessage = null;
    try {
      const userId = await this.resolveUserId();
      if (!userId) {
        this.showStatus('error', 'You must be logged in to manage auto top-up settings.');
        return;
      }

      const payload = {
        user_id: userId,
        is_auto_topup: true,
        min_balance: minBalanceValue,
        auto_topup_amount: autoTopUpAmountValue,
        auto_topup_frequency: this.autoTopUpFrequency
      };

      await firstValueFrom(this.apiService.post('/api/user/auto-topup-settings', payload));

      this.isAutoTopUpEnabled = true;
      this.minBalance = minBalanceValue.toFixed(2);
      this.autoTopUpAmount = autoTopUpAmountValue.toFixed(2);
      this.showAutoTopUpModal = false;
      this.showStatus('success', `Auto Top-Up enabled! Your account will be topped up with R${this.autoTopUpAmount} when balance falls below R${this.minBalance}.`);

      await this.fetchAutoTopUpSettings();
    } catch (error) {
      this.showStatus('error', 'Failed to save auto top-up settings.');
    } finally {
      this.isProcessing = false;
    }
  }

  // Resolve user id from local storage or backend (JWT)
  private async resolveUserId(): Promise<number | null> {
    const local = this.apiService.getCurrentUser();
    if (local?.id) return local.id;
    try {
      const me = await firstValueFrom(this.apiService.get<any>('/api/auth/user'));
      if (me?.id) {
        localStorage.setItem('user', JSON.stringify({ id: me.id, email: me.email, name: me.full_name }));
        return me.id;
      }
    } catch (_) {
      // ignore; caller will handle null
    }
    return null;
  }

  // Show status message
  showStatus(type: 'success' | 'error' | 'warning', message: string) {
    this.statusMessage = { type, message };
    setTimeout(() => this.statusMessage = null, 5000);
  }

  // Toggle auto top-up modal
  toggleAutoTopUpModal() {
    this.showAutoTopUpModal = !this.showAutoTopUpModal;
  }
}