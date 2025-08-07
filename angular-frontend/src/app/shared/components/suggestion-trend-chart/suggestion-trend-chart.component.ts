import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';

interface SuggestionData {
  created_at: string; // ISO string date
  // Other properties of suggestion if any
}

interface ChartDisplayData {
  date: string;
  count: number;
  fullDate: string;
}

@Component({
  selector: 'app-suggestion-trend-chart',
  templateUrl: './suggestion-trend-chart.component.html',
  styleUrls: ['./suggestion-trend-chart.component.scss'],
  standalone: true,
  imports: [CommonModule, BaseChartDirective]
})
export class SuggestionTrendChartComponent implements OnInit, OnChanges {
  @Input() data: SuggestionData[] = [];
  @Input() days: number = 7; // Default to 7 days

  public chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        enabled: false, // Disable default tooltip
        external: this.createExternalTooltip.bind(this) // Use custom external tooltip
      },
      legend: {
        display: false // No legend in original
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#F7FAFC',
          font: { size: 12 }
        },
        grid: {
          color: '#38B2AC' // axisLine={{ stroke: '#38B2AC' }}
        }
      },
      y: {
        beginAtZero: true, // Ensure y-axis starts at zero
        ticks: {
          color: '#F7FAFC',
          font: { size: 12 },
          stepSize: 1, // Ensure integer ticks for counts
        },
        grid: {
          color: '#38B2AC' // axisLine={{ stroke: '#38B2AC' }}
        }
      }
    }
  };
  public chartType: ChartType = 'line'; // AreaChart is usually a filled line chart
  public chartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Suggestions',
        backgroundColor: '#D6BCFA', // fill="#D6BCFA"
        borderColor: '#805AD5', // stroke="#805AD5"
        borderWidth: 2, // strokeWidth={2}
        fill: 'origin', // Fill to origin to make it an area chart
        tension: 0.4 // type="monotone" is approximated by tension
      }
    ]
  };

  constructor() { }

  ngOnInit(): void {
    this.processChartData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Re-process data if input data or days change
    if (changes['data'] || changes['days']) {
      this.processChartData();
    }
  }

  private processChartData(): void {
    const groupedByDate: { [key: string]: number } = {};

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.days);

    const filteredData = this.data.filter(s => {
      const suggestionDate = new Date(s.created_at || Date.now());
      return suggestionDate >= cutoffDate;
    });

    filteredData.forEach(s => {
      const dateKey = new Date(s.created_at || Date.now()).toISOString().split('T')[0];
      groupedByDate[dateKey] = (groupedByDate[dateKey] || 0) + 1;
    });

    const chartDisplayData: ChartDisplayData[] = Object.entries(groupedByDate)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count,
        fullDate: date
      }));

    this.chartData.labels = chartDisplayData.map(item => item.date);
    this.chartData.datasets[0].data = chartDisplayData.map(item => item.count);

    // Trigger chart update
    this.chartData = { ...this.chartData };
  }

  createExternalTooltip(context: any): void {
    let tooltipEl = document.getElementById('chartjs-tooltip');

    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.id = 'chartjs-tooltip';
      tooltipEl.classList.add('custom-chart-tooltip');
      document.body.appendChild(tooltipEl);
    }

    const tooltipModel = context.tooltip;

    if (tooltipModel.opacity === 0) {
      tooltipEl.style.opacity = '0';
      return;
    }

    tooltipEl.classList.remove('no-transform', 'transform-left', 'transform-right');
    if (tooltipModel.yAlign) {
      tooltipEl.classList.add(tooltipModel.yAlign);
    } else {
      tooltipEl.classList.add('no-transform');
    }

    if (tooltipModel.body) {
      const titleLines = tooltipModel.title || [];
      const bodyLines = tooltipModel.body.map((b: any) => b.lines);

      let innerHtml = '';

      titleLines.forEach(function(title: string) {
        innerHtml += '<strong class="tooltip-title">' + title + '</strong>';
      });

      bodyLines.forEach(function(body: string[], i: number) {
        const value = tooltipModel.dataPoints[i].raw; // This will be the count
        innerHtml += `<span class="tooltip-value">${value} suggestions</span>`;
      });

      tooltipEl.innerHTML = innerHtml;
    }

    const position = context.chart.canvas.getBoundingClientRect();

    tooltipEl.style.opacity = '1';
    tooltipEl.style.left = position.left + tooltipModel.caretX + 'px';
    tooltipEl.style.top = position.top + tooltipModel.caretY + 'px';
    tooltipEl.style.font = tooltipModel.options.bodyFont.string;
    tooltipEl.style.padding = tooltipModel.options.padding + 'px ' + tooltipModel.options.padding + 'px';
  }
}