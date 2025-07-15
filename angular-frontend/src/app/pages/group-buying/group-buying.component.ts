import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CampaignDialogComponent } from '../../components/campaign-dialog/campaign-dialog.component';

interface Campaign {
  id: number;
  product: string;
  image: string;
  originalPrice: number;
  groupPrice: number;
  goal: number;
  participants: number;
  deadline: string;
  description: string;
  timeLeft: string;
  category: string;
}

@Component({
  selector: 'app-group-buying',
  templateUrl: './group-buying.component.html',
  styleUrls: ['./group-buying.component.scss']
})
export class GroupBuyingComponent {
  campaigns = [
    {
      id: 1,
      product: 'Solar Panel (350W)',
      image: 'assets/images/solar_panel_350w.png',
      originalPrice: 2000,
      groupPrice: 1500,
      goal: 20,
      participants: 12,
      deadline: '2024-04-30',
      description: 'High-efficiency monocrystalline solar panels',
      timeLeft: '15 days left',
      category: 'Solar Panels'
    },
    {
      id: 2,
      product: 'Inverter (5kW Hybrid)',
      image: 'assets/images/inverter__5kw_hybrid.png',
      originalPrice: 22000,
      groupPrice: 18000,
      goal: 10,
      participants: 8,
      deadline: '2024-05-15',
      description: 'Smart hybrid inverter with battery backup',
      timeLeft: '30 days left',
      category: 'Inverters'
    },
    {
      id: 3,
      product: 'Battery Bank (10kWh)',
      image: 'assets/images/battery_bank_10_kwh.png',
      originalPrice: 55000,
      groupPrice: 45000,
      goal: 5,
      participants: 3,
      deadline: '2024-05-01',
      description: 'Lithium-ion battery bank',
      timeLeft: '16 days left',
      category: 'Batteries'
    }
  ];

  constructor(
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {}

  getProgress(campaign: Campaign): number {
    return (campaign.participants / campaign.goal) * 100;
  }

  openNewCampaignDialog(): void {
    const dialogRef = this.dialog.open(CampaignDialogComponent, {
      width: '600px',
      data: { campaign: this.fb.group({
        product: ['', Validators.required],
        description: ['', Validators.required],
        originalPrice: [0, [Validators.required, Validators.min(1)]],
        groupPrice: [0, [Validators.required, Validators.min(1)]],
        targetBuyers: [10, Validators.required],
        deadline: ['', Validators.required],
        image: [null],
        category: ['Solar Panels']
      })}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.campaigns.push({
          ...result.value,
          id: Date.now(),
          participants: 0,
          timeLeft: this.calculateTimeLeft(result.value.deadline)
        });
      }
    });
  }

  private calculateTimeLeft(deadline: string): string {
    const diff = new Date(deadline).getTime() - Date.now();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${days} days left`;
  }
}
