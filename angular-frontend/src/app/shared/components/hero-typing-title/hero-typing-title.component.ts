import { Component, Input, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-hero-typing-title',
  templateUrl: './hero-typing-title.component.html',
  styleUrls: ['./hero-typing-title.component.scss']
})
export class HeroTypingTitleComponent implements OnInit, OnDestroy {
  @Input() color: string = 'black';

  sequences: string[] = [
    'Monitor your energy in real-time ⚡️',
    'Predict future usage with AI 🧠',
    'Join the energy-smart community 🌍',
    'Beat load shedding schedules 🔌',
    'Optimize solar investments ☀️',
    'Track daily energy savings 💰',
    'Share power with neighbors 🤝',
    'Analyze consumption patterns 📊',
    'Get outage predictions ⚠️',
    'Compare community usage 👥',
    'Manage battery storage 🔋',
    'Receive smart grid alerts 📲',
    'Plan eco-friendly budgets 🌱'
  ];
  currentSequenceIndex: number = 0;
  typedText: string = '';
  isDeleting: boolean = false;
  typingSpeed: number = 100; // milliseconds per character
  deletingSpeed: number = 50; // milliseconds per character
  pauseTime: number = 2000; // milliseconds

  private typingTimeout: any;

  ngOnInit() {
    this.startTypingAnimation();
  }

  ngOnDestroy() {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
  }

  private startTypingAnimation() {
    const currentText = this.sequences[this.currentSequenceIndex];

    if (this.isDeleting) {
      // Deleting phase
      this.typedText = currentText.substring(0, this.typedText.length - 1);
      this.typingTimeout = setTimeout(() => this.startTypingAnimation(), this.deletingSpeed);
    } else {
      // Typing phase
      this.typedText = currentText.substring(0, this.typedText.length + 1);
      this.typingTimeout = setTimeout(() => this.startTypingAnimation(), this.typingSpeed);
    }

    if (!this.isDeleting && this.typedText === currentText) {
      // Pause at the end of typing
      this.typingTimeout = setTimeout(() => {
        this.isDeleting = true;
        this.startTypingAnimation();
      }, this.pauseTime);
    } else if (this.isDeleting && this.typedText === '') {
      // Move to next sequence after deleting
      this.isDeleting = false;
      this.currentSequenceIndex = (this.currentSequenceIndex + 1) % this.sequences.length;
      this.typingTimeout = setTimeout(() => this.startTypingAnimation(), 500); // Short pause before typing next
    }
  }
}