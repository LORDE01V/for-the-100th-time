import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

interface ForumPost {
  name: string;
  avatarColor: string;
  message: string;
}

interface ForumTopic {
  id: number;
  title: string;
  author: string;
  lastActivity: string;
  replies: number;
  posts: ForumPost[];
}

@Component({
  selector: 'app-forum',
  templateUrl: './forum.html',
  styleUrls: ['./forum.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class Forum {
  // Background image for renewable energy theme
  backgroundImageUrl: SafeUrl;

  dummyTopics: ForumTopic[] = [
    {
      id: 1,
      title: 'Solar Panel Maintenance Tips',
      author: 'John Doe',
      lastActivity: '2025-03-15',
      replies: 5,
      posts: [
        { name: "Ayanda", avatarColor: "teal", message: "Regular cleaning of panels is essential for efficiency." },
        { name: "Sipho", avatarColor: "orange", message: "Check for dust buildup every month." },
        { name: "Lerato", avatarColor: "purple", message: "Use mild soap for washing to avoid damage." },
        { name: "Thabo", avatarColor: "blue", message: "Inspect wiring for any signs of wear." },
        { name: "Zanele", avatarColor: "pink", message: "Angle adjustments based on seasons help." },
      ]
    },
    {
      id: 2,
      title: 'Best Energy Storage Solutions',
      author: 'Sarah Wilson',
      lastActivity: '2025-03-14',
      replies: 8,
      posts: [
        { name: "David", avatarColor: "green", message: "Lithium-ion batteries are the most efficient for home use." },
        { name: "Maria", avatarColor: "red", message: "Consider the lifespan and warranty before purchasing." },
        { name: "James", avatarColor: "indigo", message: "Flow batteries are great for long-term storage." },
      ]
    },
    {
      id: 3,
      title: 'Wind Turbine Installation Guide',
      author: 'Mike Johnson',
      lastActivity: '2025-03-13',
      replies: 12,
      posts: [
        { name: "Emma", avatarColor: "yellow", message: "Height and location are crucial for optimal performance." },
        { name: "Robert", avatarColor: "cyan", message: "Check local zoning regulations first." },
        { name: "Lisa", avatarColor: "magenta", message: "Professional installation is highly recommended." },
      ]
    },
    {
      id: 4,
      title: 'Energy Bill Reduction Strategies',
      author: 'Alex Chen',
      lastActivity: '2025-03-12',
      replies: 15,
      posts: [
        { name: "Tom", avatarColor: "lime", message: "Smart thermostats can save up to 20% on heating/cooling." },
        { name: "Anna", avatarColor: "brown", message: "LED lighting is a simple but effective upgrade." },
        { name: "Chris", avatarColor: "navy", message: "Energy audits help identify waste areas." },
      ]
    },
    {
      id: 5,
      title: 'Renewable Energy Tax Incentives',
      author: 'Jennifer Lee',
      lastActivity: '2025-03-11',
      replies: 6,
      posts: [
        { name: "Mark", avatarColor: "olive", message: "Federal tax credits can cover 30% of installation costs." },
        { name: "Rachel", avatarColor: "coral", message: "State incentives vary significantly by location." },
        { name: "Paul", avatarColor: "slate", message: "Keep all receipts for tax documentation." },
      ]
    },
    {
      id: 6,
      title: 'Smart Grid Integration Tips',
      author: 'Carlos Rodriguez',
      lastActivity: '2025-03-10',
      replies: 9,
      posts: [
        { name: "Sophie", avatarColor: "gold", message: "Smart meters provide real-time energy usage data." },
        { name: "Daniel", avatarColor: "silver", message: "Grid-tied systems can sell excess energy back." },
        { name: "Nina", avatarColor: "bronze", message: "Battery backup systems provide power during outages." },
      ]
    }
  ];

  selectedTopic: ForumTopic | null = null;
  newMessage: string = '';
  summary: string | null = null;
  isLoading: boolean = false;
  replies: { [topicId: number]: ForumPost[] } = {};
  tone: string | null = null;
  isSummarized: boolean = false;
  isCheckingTone: boolean = false;
  showOriginalForum: boolean = true;

  constructor(private sanitizer: DomSanitizer) {
    // Set renewable energy background image
    this.backgroundImageUrl = this.sanitizer.bypassSecurityTrustUrl('assets/images/renewable-energy-background.jpg');
  }

  selectTopic(topic: ForumTopic) {
    this.selectedTopic = topic;
    this.summary = null;
    this.isSummarized = false;
    this.tone = null;
  }

  postMessage() {
    if (!this.newMessage.trim()) {
      alert('Please type a message before posting.');
      return;
    }
    const topicId = this.selectedTopic!.id;
    if (!this.replies[topicId]) this.replies[topicId] = [];
    this.replies[topicId].push({
      name: "Current User",
      avatarColor: "gray",
      message: this.newMessage.trim(),
    });
    this.newMessage = '';
    alert('Message posted!');
  }

  async summarizeDiscussion() {
    this.isSummarized = true;
    this.isLoading = true;
    const allPosts = this.selectedTopic!.posts.map(post => post.message).join(' ');
    // Simulate async summary
    await new Promise(res => setTimeout(res, 1500));
    this.summary = `Summary of the message: "${allPosts.substring(0, 100)}..."`;
    this.isLoading = false;
  }

  showFullPosts() {
    this.summary = null;
    this.isSummarized = false;
  }

  async checkTone() {
    if (!this.newMessage.trim()) {
      alert('Please type a message to check the tone.');
      return;
    }
    this.isCheckingTone = true;
    this.tone = null;
    // Simulate async tone check
    await new Promise(res => setTimeout(res, 1000));
    // Dummy tone detection
    const msg = this.newMessage.toLowerCase();
    if (msg.includes('good') || msg.includes('great')) this.tone = 'positive';
    else if (msg.includes('bad') || msg.includes('terrible')) this.tone = 'negative';
    else this.tone = 'neutral';
    this.isCheckingTone = false;
  }

  getCurrentPosts(): ForumPost[] {
    if (!this.selectedTopic) return [];
    const topicId = this.selectedTopic.id;
    const allPosts = [...this.selectedTopic.posts, ...(this.replies[topicId] || [])];
    if (this.isSummarized && this.summary) {
      return [{ name: "AI Summary", avatarColor: "purple", message: this.summary }];
    }
    return allPosts;
  }
}
