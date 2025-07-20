import { Component } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-refer-page',
  templateUrl: './refer-page.component.html',
  styleUrls: ['./refer-page.component.scss']
})
export class ReferPageComponent {
  copied = false;
  userId = "USER123";
  referralLink = `https://app.com/register?ref=${this.userId}`;

  referralHistory = [
    {
      id: 1,
      name: "Thabo Mkhize",
      date: "2025-03-15",
      status: "completed",
      reward: "50 energy units"
    },
    {
      id: 2,
      name: "Nomsa Dlamini",
      date: "2025-03-10",
      status: "pending",
      reward: "25 energy units"
    },
    {
      id: 3,
      name: "Sipho Nkosi",
      date: "2025-03-05",
      status: "completed",
      reward: "50 energy units"
    }
  ];

  constructor(
    private clipboard: Clipboard,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  handleCopyLink() {
    this.clipboard.copy(this.referralLink);
    this.copied = true;
    this.snackBar.open('Link copied to clipboard!', 'Close', {
      duration: 2000,
      panelClass: 'success-snackbar'
    });
    setTimeout(() => this.copied = false, 2000);
  }

  handleShare(platform: string) {
    const shareText = "Join me on this amazing energy platform! Use my referral link: ";
    let shareUrl = '';

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
    }

    window.open(shareUrl, '_blank');
  }

  navigateBack() {
    this.router.navigate(['/home']);
  }
}
