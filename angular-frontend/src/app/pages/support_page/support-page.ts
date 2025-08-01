import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface FaqItem {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-support-page',
  templateUrl: './support-page.html',
  styleUrls: ['./support-page.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class SupportPage {
  // FAQ Data
  faqItems: FaqItem[] = [
    {
      question: 'How do I top up my solar energy credit?',
      answer: 'You can top up your energy credit on the Top-Up page. Select your preferred amount or enter a voucher code and follow the payment instructions.'
    },
    {
      question: 'How can I track my energy usage?',
      answer: 'Your energy usage and analytics can be viewed on the Dashboard page, which provides daily, weekly, and monthly summaries.'
    },
    {
      question: 'What should I do if my solar system is not generating power?',
      answer: 'First, check the System Status page for any alerts. If the issue persists, please contact our support team using the form below or the contact details provided.'
    },
    {
      question: 'How do I update my profile information?',
      answer: 'You can update your personal details, such as phone number and address, on the Profile page.'
    }
  ];

  // Contact form state
  name = '';
  email = '';
  subject = '';
  message = '';
  isSubmitting = false;
  submitStatus: { type: 'success' | 'error', message: string } | null = null;

  // Accordion state
  openFaqIndex: number | null = null;

  // Navigation
  goBack() {
    window.location.href = '/home';
  }

  // Accordion toggle
  toggleFaq(index: number) {
    this.openFaqIndex = this.openFaqIndex === index ? null : index;
  }

  // Contact form submit
  async handleContactSubmit(event: Event) {
    event.preventDefault();
    this.isSubmitting = true;
    this.submitStatus = null;
    try {
      // Replace with your real API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.submitStatus = {
        type: 'success',
        message: 'Your support request has been received. We will contact you shortly.'
      };
      this.name = '';
      this.email = '';
      this.subject = '';
      this.message = '';
    } catch {
      this.submitStatus = {
        type: 'error',
        message: 'Failed to send message. Please try again later.'
      };
    } finally {
      this.isSubmitting = false;
      setTimeout(() => this.submitStatus = null, 5000);
    }
  }
}
