import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
    // ... (add the rest of the topics from ForumPage.js)
  ];

  selectedTopic: ForumTopic | null = null;
  newMessage: string = '';
  summary: string | null = null;
  isLoading: boolean = false;
  replies: { [topicId: number]: ForumPost[] } = {};
  tone: string | null = null;
  isSummarized: boolean = false;
  isCheckingTone: boolean = false;

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