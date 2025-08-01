import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

interface Referral {
  id: number;
  name: string;
  date: string;
  status: 'completed' | 'pending';
  reward: string;
}

@Component({
  selector: 'app-refer-page',
  templateUrl: './refer-page.html',
  styleUrls: ['./refer-page.scss'],
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule]
})
export class ReferPage {
  copied = false;
  userId = 'USER123'; // Replace with real user ID from auth
  referralLink = `https://app.com/register?ref=${this.userId}`;

  referralHistory: Referral[] = [
    { id: 1, name: "Thabo Mkhize", date: "2025-03-15", status: "completed", reward: "50 energy units" },
    { id: 2, name: "Nomsa Dlamini", date: "2025-03-10", status: "pending", reward: "25 energy units" },
    { id: 3, name: "Sipho Nkosi", date: "2025-03-05", status: "completed", reward: "50 energy units" }
  ];

  get totalReferrals(): number {
    return this.referralHistory.length;
  }

  get totalRewards(): string {
    const total = this.referralHistory.reduce((sum, r) => {
      const match = r.reward.match(/\d+/);
      return sum + (match ? parseInt(match[0], 10) : 0);
    }, 0);
    return `${total} units`;
  }

  handleCopyLink(input: HTMLInputElement) {
    input.select();
    document.execCommand('copy');
    this.copied = true;
    setTimeout(() => this.copied = false, 2000);
    // Optionally, use Angular Material Snackbar for feedback
  }

  handleShare(platform: string) {
    let shareUrl = '';
    const shareText = "Join me on this amazing energy platform! Use my referral link: ";
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText + this.referralLink)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.referralLink)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=Join me on Energy Platform&body=${encodeURIComponent(shareText + this.referralLink)}`;
        break;
      default:
        return;
    }
    window.open(shareUrl, '_blank');
  }

  goBack() {
    window.history.back();
  }
}