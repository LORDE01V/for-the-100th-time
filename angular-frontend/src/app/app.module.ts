import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface Expense {
  id: number;
  date: string;
  amount: number;
  category: string;
  status: string;
}

@Component({
  selector: 'app-expenses-page',
  templateUrl: './expenses-page.component.html',
  styleUrls: ['./expenses-page.component.scss']
})
export class ExpensesPageComponent {
  expenses: Expense[] = [
    {
      id: 1,
      date: '2024-03-15',
      amount: 150.00,
      category: 'Electricity',
      status: 'Paid'
    },
    {
      id: 2,
      date: '2024-03-10',
      amount: 75.50,
      category: 'Solar Maintenance',
      status: 'Pending'
    },
    {
      id: 3,
      date: '2024-03-05',
      amount: 200.00,
      category: 'Equipment',
      status: 'Paid'
    }
  ];

  get totalExpenses(): number {
    return this.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  }

  get monthlyAverage(): number {
    return this.totalExpenses / this.expenses.length;
  }

  constructor(private router: Router) {}

  navigateBack() {
    this.router.navigate(['/home']);
  }
}
