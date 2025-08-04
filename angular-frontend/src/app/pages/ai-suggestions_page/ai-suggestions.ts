import { Component, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common'; // Required for ngIf, ngFor
import { FormsModule } from '@angular/forms'; // Required for ngModel (two-way data binding on inputs)
import { RouterLink } from '@angular/router'; // For routerLink if you're linking to other routes

@Component({
  selector: 'app-ai-suggestions',
  standalone: true, // Mark component as standalone
  imports: [
    CommonModule, // Required for ngIf, ngFor
    FormsModule,  // Required for ngModel (two-way data binding on inputs)
    RouterLink    // If you plan to use routerLink for navigation
  ],
  templateUrl: './ai-suggestions.html',
  styleUrl: './ai-suggestions.scss'
})
export class AiSuggestions implements OnInit {
  // State variables - converted from React's useState to Angular's signal
  suggestions = signal<any[]>([]);
  filteredSuggestions = signal<any[]>([]);
  searchTerm = signal('');
  activeCategory = signal('All');
  sortByVotes = signal(true);
  dailyTip = signal<any>(null);
  viewCount = signal(0);
  showFeedback = signal(false);

  // Enhanced features state
  priorityFilter = signal<string | null>(null);
  votes = signal<{ [key: number]: number }>({});
  selectedSuggestion = signal<any>(null);
  trendDays = signal(7);
  feedbackComment = signal('');

  // User Comments
  comments = signal<{ [key: number]: string[] }>({});

  // User Goal Tracking
  goal = signal(0);

  // Favorites
  favorites = signal<number[]>([]);

  // User Notes
  userNotes = signal<{ [key: number]: string }>({});

  // Mock data as a class property for easier access
  private mockSuggestions = [
    { 
      id: 1, 
      title: "Save Energy", 
      description: "Turn off unused appliances to reduce energy consumption by 15%.", 
      category: "Energy Saving", 
      votes: 10, 
      priority: "high",
      estimated_savings: 150.50,
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    { 
      id: 2, 
      title: "Maintenance Alert", 
      description: "Check your solar panels for dust accumulation.", 
      category: "Maintenance", 
      votes: 5, 
      priority: "medium",
      estimated_savings: 75.25,
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    { 
      id: 3, 
      title: "Upgrade Recommendation", 
      description: "Consider upgrading to a 5kW inverter for better efficiency.", 
      category: "Upgrades", 
      votes: 8, 
      priority: "low",
      estimated_savings: 300.00,
      created_at: new Date().toISOString()
    },
    { 
      id: 4, 
      title: "Smart Thermostat", 
      description: "Install a smart thermostat to optimize heating and cooling.", 
      category: "Energy Saving", 
      votes: 12, 
      priority: "high",
      estimated_savings: 200.00,
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    { 
      id: 5, 
      title: "LED Lighting", 
      description: "Replace traditional bulbs with LED lights for 80% energy savings.", 
      category: "Upgrades", 
      votes: 15, 
      priority: "medium",
      estimated_savings: 120.75,
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  // Computed property for sorted suggestions, similar to useMemo
  sortedSuggestions = computed(() => {
    let suggestionsCopy = [...this.filteredSuggestions()];
    
    // Apply priority filter
    if (this.priorityFilter()) {
      suggestionsCopy = suggestionsCopy.filter(s => s.priority === this.priorityFilter());
    }
    
    // Sort by votes or date
    if (this.sortByVotes()) {
      return suggestionsCopy.sort((a, b) => {
        const aTotalVotes = (a.votes || 0) + (this.votes()[a.id] || 0);
        const bTotalVotes = (b.votes || 0) + (this.votes()[b.id] || 0);
        return bTotalVotes - aTotalVotes;
      });
    } else {
      return suggestionsCopy.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  });


  ngOnInit() {
    // Mimics useEffect for initial data load
    this.suggestions.set(this.mockSuggestions);
    this.filteredSuggestions.set(this.mockSuggestions);

    // Load from localStorage (you'll need to add proper localStorage handling later)
    const storedComments = JSON.parse(localStorage.getItem("ai_comments") || '{}');
    this.comments.set(storedComments);

    const storedGoal = Number(localStorage.getItem("ai_goal")) || 0;
    this.goal.set(storedGoal);

    const storedFavorites = JSON.parse(localStorage.getItem("favorites") || '[]');
    this.favorites.set(storedFavorites);

    const storedNotes = JSON.parse(localStorage.getItem("ai_notes") || '{}');
    this.userNotes.set(storedNotes);

    const storedVotes = JSON.parse(localStorage.getItem("aiVotes") || '{}');
    this.votes.set(storedVotes);

    // Daily Tip initial load (simplified for now)
    const today = new Date().toDateString();
    const cachedTip = JSON.parse(localStorage.getItem("dailyAITip") || 'null');
    if (cachedTip && cachedTip.date === today) {
      this.dailyTip.set(cachedTip.tip);
    } else {
      if (this.mockSuggestions.length > 0) {
        const randomTip = this.mockSuggestions[Math.floor(Math.random() * this.mockSuggestions.length)];
        this.dailyTip.set(randomTip);
        localStorage.setItem("dailyAITip", JSON.stringify({ date: today, tip: randomTip }));
      }
    }

    // Feedback mechanism
    // In Angular, we need to manually trigger the check for viewCount changes
    // This is a simplified example; a more robust solution might involve a service
    // or a dedicated feedback component watching this signal.
    // For now, let's just run it once on init for demonstration
    const storedFeedbackGiven = localStorage.getItem("ai_feedback_given");
    if (this.viewCount() >= 5 && !storedFeedbackGiven) {
      this.showFeedback.set(true);
    }
  }

  handleComment(id: number, comment: string) {
    this.comments.update(currentComments => {
      const newComments = { ...currentComments, [id]: [...(currentComments[id] || []), comment] };
      localStorage.setItem("ai_comments", JSON.stringify(newComments));
      return newComments;
    });
  }

  handleGoalChange(event: Event) {
    const value = Number((event.target as HTMLInputElement).value);
    this.goal.set(value);
    localStorage.setItem("ai_goal", value.toString());
  }

  toggleFavorite(id: number) {
    this.favorites.update(currentFavorites => {
      const updated = new Set(currentFavorites);
      updated.has(id) ? updated.delete(id) : updated.add(id);
      const arr = Array.from(updated);
      localStorage.setItem("favorites", JSON.stringify(arr));
      return arr;
    });
  }

  handleNoteChange(id: number, event: Event) {
    const note = (event.target as HTMLTextAreaElement).value;
    this.userNotes.update(currentNotes => {
      const newNotes = { ...currentNotes, [id]: note };
      localStorage.setItem("ai_notes", JSON.stringify(newNotes));
      return newNotes;
    });
  }

  getPriorityProps(priority: string) {
    switch (priority) {
      case 'high':
        return { 
          color: 'red', 
          icon: '🚨', // Using emoji as placeholder for icons
          label: 'High impact - Immediate attention recommended' 
        };
      case 'medium':
        return { 
          color: 'orange', 
          icon: 'ℹ️', 
          label: 'Moderate impact - Consider implementing soon' 
        };
      case 'low':
        return { 
          color: 'green', 
          icon: '✅', 
          label: 'Low impact - Good to implement when convenient' 
        };
      default:
        return { 
          color: 'gray', 
          icon: '', 
          label: 'No priority set' 
        };
    }
  }

  handleSearch(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    this.searchTerm.set(term);
    const filtered = this.suggestions().filter((s) =>
      s.title.toLowerCase().includes(term.toLowerCase()) || s.description.toLowerCase().includes(term.toLowerCase())
    );
    this.filteredSuggestions.set(filtered);
  }

  handleCategoryChange(category: string) {
    this.activeCategory.set(category);
    if (category === "All") {
      this.filteredSuggestions.set(this.suggestions());
    } else if (category === "Favorites") {
      this.filteredSuggestions.set(this.suggestions().filter(s => this.favorites().includes(s.id)));
    } else {
      const filtered = this.suggestions().filter((s) => s.category === category);
      this.filteredSuggestions.set(filtered);
    }
  }

  handleVote(id: number, direction: number) {
    this.votes.update(currentVotes => {
      const newVotes = {
        ...currentVotes,
        [id]: (currentVotes[id] || 0) + direction
      };
      localStorage.setItem("aiVotes", JSON.stringify(newVotes));
      return newVotes;
    });
    // For toast, we'll need a different implementation in Angular
    console.log(`Suggestion ${id} ${direction > 0 ? 'upvoted' : 'downvoted'}`);
  }

  refreshTip() {
    if (this.suggestions().length > 0) {
      const randomTip = this.suggestions()[Math.floor(Math.random() * this.suggestions().length)];
      this.dailyTip.set(randomTip);
      localStorage.setItem("dailyAITip", JSON.stringify({
        date: new Date().toDateString(),
        tip: randomTip
      }));
      console.log('New tip loaded!');
    }
  }

  notifyTip() {
    // Notification API requires browser context and user permission
    if (typeof Notification !== 'undefined' && Notification.permission === "granted") {
      new Notification("Your AI Energy Tip", {
        body: this.dailyTip()?.description,
        icon: '/logo192.png' // Ensure this path is correct relative to index.html
      });
      console.log('Reminder set!');
    } else if (typeof Notification !== 'undefined' && Notification.permission === "default") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          this.notifyTip();
        }
      });
    }
  }

  copyTip() {
    if (this.dailyTip()?.description && navigator.clipboard) {
      navigator.clipboard.writeText(this.dailyTip()!.description).then(() => {
        console.log("Tip copied to clipboard!");
      });
    }
  }

  shareTip() {
    if (this.dailyTip()?.description) {
      const text = `AI Energy Tip: ${this.dailyTip()?.description}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, '_blank');
    }
  }

  handleFeedback(response: string) {
    const feedbackData = { 
      response, 
      comment: this.feedbackComment(),
      date: new Date().toISOString() 
    };
    localStorage.setItem("ai_feedback_given", JSON.stringify(feedbackData));
    this.showFeedback.set(false);
    this.feedbackComment.set('');
    console.log("Thank you for your feedback!");
  }

  handleView() {
    this.viewCount.update(count => count + 1);
    // Check for feedback display after incrementing viewCount
    const storedFeedbackGiven = localStorage.getItem("ai_feedback_given");
    if (this.viewCount() >= 5 && !storedFeedbackGiven) {
      this.showFeedback.set(true);
    }
  }

  // Helper methods for template
  getDraftComment(suggestionId: number): string {
    return (this.comments() as any)['draft_' + suggestionId] || '';
  }

  updateDraftComment(suggestionId: number, value: string) {
    this.comments.update(c => ({...c, ['draft_' + suggestionId]: value}));
  }

  postComment(suggestionId: number) {
    const draftComment = this.getDraftComment(suggestionId);
    if (draftComment?.trim()) {
      this.handleComment(suggestionId, draftComment.trim());
      this.updateDraftComment(suggestionId, '');
    }
  }

  // Computed properties for template
  get totalSavings(): number {
    return this.suggestions().reduce((acc, s) => acc + (s.estimated_savings || 0), 0);
  }

  get progressPercentage(): number {
    return this.goal() ? (this.totalSavings / this.goal()) * 100 : 0;
  }

  get formattedTotalSavings(): string {
    return this.totalSavings.toFixed(2);
  }

  get selectedSuggestionData(): any {
    return this.selectedSuggestion();
  }

  closeModal() {
    this.selectedSuggestion.set(null);
  }

  // Additional helper methods for template simplification
  getCommentCount(suggestionId: number): number {
    return this.comments()[suggestionId]?.length || 0;
  }

  getVoteCount(suggestion: any): number {
    return (suggestion.votes || 0) + (this.votes()[suggestion.id] || 0);
  }

  getFormattedSavings(suggestion: any): string {
    return suggestion.estimated_savings?.toFixed(2) || 'N/A';
  }

  getFormattedTipSavings(): string {
    return this.dailyTip()?.estimated_savings?.toFixed(2) || 'N/A';
  }

  getTipDescription(): string {
    return this.dailyTip()?.description || '';
  }

  getTipCategory(): string {
    return this.dailyTip()?.category || '';
  }

  getSelectedSuggestionTitle(): string {
    return this.selectedSuggestion()?.title || '';
  }

  getSelectedSuggestionDescription(): string {
    return this.selectedSuggestion()?.description || '';
  }

  getSelectedSuggestionSavings(): string {
    return this.selectedSuggestion()?.estimated_savings?.toFixed(2) || 'N/A';
  }

  getSelectedSuggestionPriority(): string {
    return this.selectedSuggestion()?.priority?.toUpperCase() || 'MEDIUM';
  }

  getSelectedSuggestionCategory(): string {
    return this.selectedSuggestion()?.category || '';
  }

  getSelectedSuggestionVotes(): number {
    return this.getVoteCount(this.selectedSuggestion());
  }

  getSelectedSuggestionCreatedAt(): string {
    return this.selectedSuggestion()?.created_at ? new Date(this.selectedSuggestion().created_at).toLocaleDateString() : 'N/A';
  }

  isFavorite(suggestionId: number): boolean {
    return this.favorites().includes(suggestionId);
  }

  getFavoriteIcon(suggestionId: number): string {
    return this.isFavorite(suggestionId) ? '★' : '☆';
  }

  getFavoriteAriaLabel(suggestionId: number): string {
    return this.isFavorite(suggestionId) ? 'Remove from favorites' : 'Add to favorites';
  }

  getDraftCommentTrimmed(suggestionId: number): string {
    return this.getDraftComment(suggestionId)?.trim() || '';
  }

  isDraftCommentEmpty(suggestionId: number): boolean {
    return !this.getDraftCommentTrimmed(suggestionId);
  }

  isFeedbackCommentEmpty(): boolean {
    return !this.feedbackComment().trim();
  }
}