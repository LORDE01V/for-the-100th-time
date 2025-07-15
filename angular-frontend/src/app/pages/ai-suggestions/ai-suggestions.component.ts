import { Component, OnDestroy, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-ai-suggestions',
  templateUrl: './ai-suggestions.component.html',
  styleUrls: ['./ai-suggestions.component.scss']
})
export class AISuggestionsComponent implements OnDestroy {
  suggestions = [
    {
      id: 1,
      title: 'Save Energy',
      description: 'Turn off unused appliances to reduce energy consumption by 15%',
      category: 'Energy Saving',
      votes: 10,
      priority: 'high'
    },
    {
      id: 2,
      title: 'Maintenance Alert',
      description: 'Check solar panels for dust accumulation',
      category: 'Maintenance', 
      votes: 5,
      priority: 'medium'
    }
  ];

  currentTipIndex = 0;
  solarTips = [
    'Shift usage to off-peak hours',
    'Clean solar panels monthly',
    'Monitor battery health'
  ];

  activeFilter: string = 'All';
  selectedSort: string = 'recent';

  get filteredSuggestions() {
    return this.suggestions.filter(suggestion => 
      this.activeFilter === 'All' || suggestion.category === this.activeFilter
    );
  }

  nextTip() {
    this.currentTipIndex = (this.currentTipIndex + 1) % this.solarTips.length;
  }

  prevTip() {
    this.currentTipIndex = (this.currentTipIndex - 1 + this.solarTips.length) % this.solarTips.length;
  }

  constructor(private renderer: Renderer2) {
    this.renderer.addClass(document.body, 'ai-suggestions-bg');
  }

  ngOnDestroy() {
    this.renderer.removeClass(document.body, 'ai-suggestions-bg');
  }

  handleVote(id: number, direction: number) {
    const suggestion = this.suggestions.find(s => s.id === id);
    if (suggestion) {
      suggestion.votes += direction;
    }
  }

  getPriorityClass(priority: string): string {
    return {
      high: 'priority-high',
      medium: 'priority-medium',
      low: 'priority-low'
    }[priority] || '';
  }
} 