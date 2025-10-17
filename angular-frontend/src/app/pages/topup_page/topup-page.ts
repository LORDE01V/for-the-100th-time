import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

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
      // TODO: Implement API call to fetch user's auto top-up settings when backend is ready.
      // Keep current UI state for now.
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
      const currentUser = this.apiService.getCurrentUser();
      if (!currentUser || !currentUser.id) {
        this.showStatus('error', 'You must be logged in to top up.');
        return;
      }
      const payload = {
        user_id: currentUser.id,
        amount: topUpAmount,
        promo_code: this.promoCode || null,
        voucher_code: this.voucherCode || null,
      };
      const res = await this.apiService.post<any>('/api/topup', payload).toPromise();
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
      // ...
    }

    this.isProcessing = true;
    try {
      // Replace with your real API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      this.isAutoTopUpEnabled = true;
      this.showAutoTopUpModal = false;
      this.showStatus('success', `Auto Top-Up enabled! Your account will be topped up with R${this.autoTopUpAmount} when balance falls below R${this.minBalance}.`);
    } catch (error) {
      this.showStatus('error', 'Failed to save auto top-up settings.');
    } finally {
      this.isProcessing = false;
    }
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