import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { CommonModule } from '@angular/common';

interface SavingsData {
  title: string;
  estimated_savings: number;
}

interface ChartDisplayData {
  name: string;
  savings: number;
  originalData: SavingsData;
}

@Component({
  selector: 'app-savings-chart',
  templateUrl: './savings-chart.component.html',
  styleUrls: ['./savings-chart.component.scss'],
  standalone: true,
  imports: [CommonModule, BaseChartDirective]
})
export class SavingsChartComponent implements OnInit {
  @Input() data: SavingsData[] = [];
  @Output() onBarClick = new EventEmitter<SavingsData>();

  public barChartOptions: ChartOptions = {
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
        ticks: {
          color: '#F7FAFC',
          font: { size: 12 }
        },
        grid: {
          color: '#38B2AC' // axisLine={{ stroke: '#38B2AC' }}
        }
      }
    }
  };
  public barChartType: ChartType = 'bar';
  public barChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Savings',
        backgroundColor: 'rgba(72, 187, 120, 1)', // default green color, gradient will be applied in CSS
        borderColor: 'rgba(72, 187, 120, 1)',
        borderWidth: 0,
        borderRadius: 4, // radius={[4, 4, 0, 0]}
        barPercentage: 0.8, // Adjust bar width
        categoryPercentage: 0.8 // Adjust space between bars
      }
    ]
  };

  public totalSavings: number = 0;

  constructor() { }

  ngOnInit(): void {
    this.processChartData();
  }

  ngOnChanges(): void {
    // Re-process data if input data changes
    this.processChartData();
  }

  private processChartData(): void {
    const sortedData: ChartDisplayData[] = [...this.data]
      .sort((a, b) => (b.estimated_savings || 0) - (a.estimated_savings || 0))
      .map(s => ({
        name: s.title.length > 12 ? s.title.slice(0, 12) + '...' : s.title,
        savings: s.estimated_savings || 0,
        originalData: s
      }));

    this.totalSavings = sortedData.reduce((sum, item) => sum + item.savings, 0);

    this.barChartData.labels = sortedData.map(item => item.name);
    this.barChartData.datasets[0].data = sortedData.map(item => item.savings);

    // Trigger chart update
    this.barChartData = { ...this.barChartData };
  }

  // Custom tooltip logic based on Recharts' CustomTooltip
  createExternalTooltip(context: any): void {
    // Tooltip Element
    let tooltipEl = document.getElementById('chartjs-tooltip');

    // Create element on first render
    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.id = 'chartjs-tooltip';
      tooltipEl.classList.add('custom-chart-tooltip');
      document.body.appendChild(tooltipEl);
    }

    const tooltipModel = context.tooltip;

    // Hide if no tooltip
    if (tooltipModel.opacity === 0) {
      tooltipEl.style.opacity = '0';
      return;
    }

    // Set caret position
    tooltipEl.classList.remove('no-transform', 'transform-left', 'transform-right');
    if (tooltipModel.yAlign) {
      tooltipEl.classList.add(tooltipModel.yAlign);
    } else {
      tooltipEl.classList.add('no-transform');
    }

    function getBody(bodyItem: any) {
      return bodyItem.lines;
    }

    // Set Text
    if (tooltipModel.body) {
      const titleLines = tooltipModel.title || [];
      const bodyLines = tooltipModel.body.map(getBody);

      let innerHtml = '';

      titleLines.forEach(function(title: string) {
        innerHtml += '<strong class="tooltip-title">' + title + '</strong>';
      });

      bodyLines.forEach(function(body: string[], i: number) {
        const colors = tooltipModel.labelColors[i];
        const style = `background:${colors.backgroundColor}; border-color:${colors.borderColor}; border-width: 2px;`;
        // Extract original data from the context to display full title and currency
        const dataIndex = tooltipModel.dataPoints[i].dataIndex;
        const datasetIndex = tooltipModel.dataPoints[i].datasetIndex;
        const originalChartData = context.chart.data.datasets[datasetIndex].data[dataIndex];
        const originalName = context.chart.data.labels![dataIndex];
        const value = tooltipModel.dataPoints[i].raw;
        
        innerHtml += `<span class="tooltip-value">R${value.toFixed(2)}</span>`;
      });

      tooltipEl.innerHTML = innerHtml;
    }

    const position = context.chart.canvas.getBoundingClientRect();

    // Display, position, and set styles for tooltip
    tooltipEl.style.opacity = '1';
    tooltipEl.style.left = position.left + tooltipModel.caretX + 'px';
    tooltipEl.style.top = position.top + tooltipModel.caretY + 'px';
    tooltipEl.style.font = tooltipModel.options.bodyFont.string;
    tooltipEl.style.padding = tooltipModel.options.padding + 'px ' + tooltipModel.options.padding + 'px';

    // Handle click on bar for more details
    // This requires Chart.js plugins or direct event handling on the canvas
    // For simplicity, we'll emit the original data on the bar click event itself
  }

  // Handle bar click to emit event
  onChartClick(event: any): void {
    if (event.active.length > 0) {
      const datasetIndex = event.active[0].datasetIndex;
      const dataIndex = event.active[0].index;
      const clickedData = this.data.sort((a, b) => (b.estimated_savings || 0) - (a.estimated_savings || 0))[dataIndex];
      this.onBarClick.emit(clickedData);
    }
  }
}