import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private _currentThemeConfig = new BehaviorSubject({
    colors: {
      primary: 'blue.500',
      text: 'gray.700'
    }
  });

  readonly currentThemeConfig$ = this._currentThemeConfig.asObservable();

  get currentThemeConfig() {
    return this._currentThemeConfig.value;
  }

  // Method to update theme config (e.g., in response to a theme toggle)
  setTheme(theme: any) {
    this._currentThemeConfig.next(theme);
  }
}