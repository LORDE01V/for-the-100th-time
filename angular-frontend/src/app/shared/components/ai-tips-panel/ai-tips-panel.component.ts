import { Component, OnInit } from '@angular/core';
import { ThemeService } from '@services/theme.service'; // Changed path to use alias
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faDollarSign, faSun, faBatteryFull, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { CommonModule } from '@angular/common'; // Import CommonModule for ngClass/ngStyle
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'; // Import FontAwesomeModule

interface EnergyTip {
  title: string;
  content: string;
  category: string;
  icon: IconDefinition;
  badgeColor: string;
}

@Component({
  selector: 'app-ai-tips-panel',
  templateUrl: './ai-tips-panel.component.html',
  styleUrls: ['./ai-tips-panel.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
  ]
})
export class AiTipsPanelComponent implements OnInit {
  currentTipIndex: number = 0;
  energyTips: EnergyTip[] = [
    {
      title: "Peak Hour Optimization",
      content: "Shift high-energy activities to off-peak hours (10PM-6AM) to reduce costs by up to 30%",
      category: "Savings",
      icon: faDollarSign,
      badgeColor: "green"
    },
    {
      title: "Solar Utilization",
      content: "Increase solar self-consumption by scheduling pool pumps and appliances during daylight hours",
      category: "Efficiency",
      icon: faSun,
      badgeColor: "orange"
    },
    {
      title: "Battery Management",
      content: "Maintain battery charge between 20-80% for optimal lifespan and performance",
      category: "Maintenance",
      icon: faBatteryFull,
      badgeColor: "blue"
    }
  ];

  faArrowLeft = faChevronLeft;
  faArrowRight = faChevronRight;

  headingColor: string = '';
  accentColor: string = '';
  textColorPrimary: string = '';
  textColorSecondary: string = '';
  boxBgGradient: string = '';
  boxBorderColor: string = '';

  constructor(private themeService: ThemeService) { }

  ngOnInit(): void {
    this.themeService.colorMode$.subscribe((mode: 'light' | 'dark') => {
      this.headingColor = this.themeService.getColorModeValue('gray.800', 'whiteAlpha.900');
      this.accentColor = this.themeService.getColorModeValue('blue.500', 'blue.300');
      this.textColorPrimary = this.themeService.getColorModeValue('gray.800', 'white');
      this.textColorSecondary = this.themeService.getColorModeValue('gray.600', 'gray.300');
      this.boxBgGradient = this.themeService.getColorModeValue(
        'linear-gradient(to bottom right, #EBF8FF, #BEE3F8)',
        'linear-gradient(to bottom right, #1A202C, #2D3748)'
      );
      this.boxBorderColor = this.themeService.getColorModeValue('gray.700', 'gray.600');
    });
  }

  handleNextTip(): void {
    this.currentTipIndex = (this.currentTipIndex + 1) % this.energyTips.length;
  }

  handlePrevTip(): void {
    this.currentTipIndex = (this.currentTipIndex - 1 + this.energyTips.length) % this.energyTips.length;
  }

  onAvatarHover(event: Event, scale: string): void {
    const target = event.target as HTMLElement;
    if (target) {
      target.style.transform = scale;
    }
  }
}