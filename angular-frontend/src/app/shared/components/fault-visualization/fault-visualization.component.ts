import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { CommonModule } from '@angular/common';

interface FaultData {
  day: string;
  faults: number;
}

@Component({
  selector: 'app-fault-visualization',
  templateUrl: './fault-visualization.component.html',
  styleUrls: ['./fault-visualization.component.scss'],
  standalone: true,
  imports: [CommonModule, BaseChartDirective], // Import BaseChartDirective for charts
})
export class FaultVisualizationComponent implements OnInit, OnDestroy {
  public barChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Fault Visualization (Past 7 Days)',
      },
    }
  };
  public barChartType: ChartType = 'bar';
  public barChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Faults',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ]
  };

  private updateInterval: any;

  constructor() { }

  ngOnInit(): void {
    this.generateAndSetFaultData();
    this.startLiveUpdates();
  }

  ngOnDestroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  private generateDummyFaultData(): FaultData[] {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days.map(day => ({
      day,
      faults: Math.floor(Math.random() * 10) // Random number of faults (0-10)
    }));
  }

  private generateAndSetFaultData(): void {
    const data = this.generateDummyFaultData();
    this.barChartData.labels = data.map(d => d.day);
    this.barChartData.datasets[0].data = data.map(d => d.faults);
    // To ensure chart updates, reassigning the data object might be necessary depending on Chart.js version and change detection
    this.barChartData = { ...this.barChartData };
  }

  private startLiveUpdates(): void {
    this.updateInterval = setInterval(() => {
      this.generateAndSetFaultData();
    }, 300000); // Update every 5 minutes
  }
}