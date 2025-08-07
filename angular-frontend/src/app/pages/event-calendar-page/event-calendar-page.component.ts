import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '@services/theme.service';
import { ToastService } from '@services/toast.service';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Subscription } from 'rxjs';

interface CalendarEvent {
  title: string;
  start: string;
  end: string;
  description: string;
  location: string;
  eventType: string;
}

@Component({
  selector: 'app-event-calendar-page',
  templateUrl: './event-calendar-page.component.html',
  styleUrls: ['./event-calendar-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
  ]
})
export class EventCalendarPageComponent implements OnInit, OnDestroy {
  // Icons
  faChevronLeft = faChevronLeft;
  faChevronRight = faChevronRight;

  // State
  currentMonth: number;
  currentYear: number;
  selectedDate: string | null = null;
  events: { [key: string]: CalendarEvent } = {};
  isModalOpen: boolean = false;
  isDeleteModalOpen: boolean = false;
  eventData: CalendarEvent = {
    title: '',
    start: '',
    end: '',
    description: '',
    location: '',
    eventType: 'meeting'
  };
  deleteConfirmationText: string = '';
  hoveredDay: string | null = null;
  searchQuery: string = '';
  debouncedSearchQuery: string = '';
  activeFilters: string[] = [];

  private deletedEventRef: { key: string, event: CalendarEvent } | null = null;
  private searchTimeout: any;
  private themeSubscription: Subscription = new Subscription();

  // Theme-related properties
  dateBg: string = '';
  dateColor: string = '';
  monthColor: string = '';
  dayColor: string = '';
  calendarBg: string = '';
  hoverCardBg: string = '';
  hoverCardText: string = '';

  eventTypeColors: { [key: string]: string } = {};

  days: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  constructor(private themeService: ThemeService, private toastService: ToastService, private renderer: Renderer2) {
    const today = new Date();
    this.currentMonth = today.getMonth();
    this.currentYear = today.getFullYear();
  }

  ngOnInit(): void {
    this.loadEvents();
    this.setupThemeSubscription();
    this.setupDebouncedSearch();
  }

  ngOnDestroy(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.themeSubscription.unsubscribe();
  }

  private setupThemeSubscription(): void {
    this.themeSubscription = this.themeService.colorMode$.subscribe((mode: 'light' | 'dark') => {
      this.dateBg = this.themeService.getColorModeValue('gray.100', 'gray.700');
      this.dateColor = this.themeService.getColorModeValue('gray.700', 'gray.200');
      this.monthColor = this.themeService.getColorModeValue('gray.800', 'whiteAlpha.900');
      this.dayColor = this.themeService.getColorModeValue('gray.600', 'gray.300');
      this.calendarBg = this.themeService.getColorModeValue('white', 'gray.800');
      this.hoverCardBg = this.themeService.getColorModeValue('white', 'gray.700');
      this.hoverCardText = this.themeService.getColorModeValue('gray.800', 'whiteAlpha.900');

      this.eventTypeColors = {
        meeting: this.themeService.getColorModeValue('blue.500', 'blue.300'),
        maintenance: this.themeService.getColorModeValue('orange.500', 'orange.300'),
        appointment: this.themeService.getColorModeValue('green.500', 'green.300'),
        reminder: this.themeService.getColorModeValue('purple.500', 'purple.300'),
        other: this.themeService.getColorModeValue('gray.500', 'gray.300')
      };
    });
  }

  private setupDebouncedSearch(): void {
    // Implement debounce logic manually since RxJS debounceTime is typically used with observables on inputs
    // For simplicity, we'll use a basic setTimeout for now for direct input binding
  }

  onSearchQueryChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.debouncedSearchQuery = this.searchQuery.toLowerCase();
    }, 300);
  }

  loadEvents(): void {
    if (typeof localStorage !== 'undefined') {
      const savedEvents = localStorage.getItem('calendarEvents');
      if (savedEvents) {
        this.events = JSON.parse(savedEvents);
      }
    }
  }

  getDaysInMonth(month: number, year: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  get startDay(): number {
    return new Date(this.currentYear, this.currentMonth, 1).getDay();
  }

  get daysInMonth(): number {
    return this.getDaysInMonth(this.currentMonth, this.currentYear);
  }

  handlePrev(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
  }

  handleNext(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
  }

  handleDateClick(day: number): void {
    const key = `${this.currentYear}-${this.currentMonth}-${day}`;
    this.selectedDate = key;
    this.eventData = this.events[key] || {
      title: '',
      start: '',
      end: '',
      description: '',
      location: '',
      eventType: 'meeting'
    };
    this.isModalOpen = true;
  }

  saveEvent(): void {
    if (!this.eventData.title.trim() ||
      !this.eventData.start ||
      !this.eventData.end ||
      !this.eventData.description.trim() ||
      !this.eventData.location.trim()) {
      this.toastService.show({
        title: 'Missing required fields',
        description: 'Please fill in all event details',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'bottom',
      });
      return;
    }

    const updated = {
      ...this.events,
      [this.selectedDate!]: this.eventData
    };
    this.events = updated;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('calendarEvents', JSON.stringify(updated));
    }
    this.isModalOpen = false;

    this.toastService.show({
      title: 'Event created',
      description: 'Your event has been successfully saved',
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'bottom',
    });
  }

  deleteEvent(): void {
    if (this.deleteConfirmationText.toLowerCase() !== 'delete') return;

    if (this.selectedDate) {
      this.deletedEventRef = {
        key: this.selectedDate,
        event: this.events[this.selectedDate]
      };

      const updated = { ...this.events };
      delete updated[this.selectedDate];
      this.events = updated;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('calendarEvents', JSON.stringify(updated));
      }
    }

    this.deleteConfirmationText = '';
    this.isDeleteModalOpen = false;
    this.isModalOpen = false;

    this.toastService.show({
      title: 'Event deleted',
      description: 'Click Undo to restore it',
      status: 'success',
      duration: 5000,
      isClosable: true,
      position: 'bottom',
      render: (onClose: () => void) => {
        const container = this.renderer.createElement('div');
        this.renderer.setStyle(container, 'display', 'flex');
        this.renderer.setStyle(container, 'align-items', 'center');
        this.renderer.setStyle(container, 'justify-content', 'space-between');

        const text = this.renderer.createElement('span');
        text.textContent = 'Event deleted. Click Undo to restore it';
        this.renderer.appendChild(container, text);

        const button = this.renderer.createElement('button');
        button.textContent = 'Undo';
        this.renderer.setStyle(button, 'margin-left', '1rem');
        this.renderer.setStyle(button, 'background', 'none');
        this.renderer.setStyle(button, 'border', '1px solid white');
        this.renderer.setStyle(button, 'color', 'white');
        this.renderer.setStyle(button, 'padding', '0.25rem 0.5rem');
        this.renderer.setStyle(button, 'border-radius', '0.25rem');
        this.renderer.setStyle(button, 'cursor', 'pointer');
        this.renderer.listen(button, 'click', () => {
          if (this.deletedEventRef) {
            const { key, event } = this.deletedEventRef;
            this.events = {
              ...this.events,
              [key]: event
            };
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem('calendarEvents', JSON.stringify(this.events));
            }
            this.deletedEventRef = null;
            onClose();
          }
        });
        this.renderer.appendChild(container, button);
        return container;
      }
    });
  }

  toggleFilter(eventType: string): void {
    if (this.activeFilters.includes(eventType)) {
      this.activeFilters = this.activeFilters.filter(f => f !== eventType);
    } else {
      this.activeFilters = [...this.activeFilters, eventType];
    }
  }

  getCalendarDays(): { day: number | null, isEvent: boolean, eventType?: string }[] {
    const daysArray: { day: number | null, isEvent: boolean, eventType?: string }[] = [];
    const totalCells = this.startDay + this.daysInMonth;

    for (let i = 0; i < totalCells; i++) {
      const isEmpty = i < this.startDay;
      if (isEmpty) {
        daysArray.push({ day: null, isEvent: false });
      } else {
        const currentDay = i - this.startDay + 1;
        const key = `${this.currentYear}-${this.currentMonth}-${currentDay}`;
        const event = this.events[key];
        const isEvent = event &&
          event.title.toLowerCase().includes(this.debouncedSearchQuery) &&
          (this.activeFilters.length === 0 || this.activeFilters.includes(event.eventType));
        daysArray.push({ day: currentDay, isEvent: isEvent, eventType: event?.eventType });
      }
    }
    return daysArray;
  }

  getEventDetails(day: number): CalendarEvent | null {
    const key = `${this.currentYear}-${this.currentMonth}-${day}`;
    return this.events[key] || null;
  }

  formatTime(isoString: string): string {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}