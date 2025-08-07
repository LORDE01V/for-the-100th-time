import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private _colorMode = new BehaviorSubject<'light' | 'dark'>(this.getInitialColorMode());

  readonly colorMode$ = this._colorMode.asObservable();

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.applyColorMode(this._colorMode.value);
  }

  private getInitialColorMode(): 'light' | 'dark' {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedMode = localStorage.getItem('chakra-ui-color-mode');
      if (savedMode === 'light' || savedMode === 'dark') {
        return savedMode;
      }
    }
    // Default to light mode or respect system preference
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  toggleColorMode(): void {
    const newMode = this._colorMode.value === 'light' ? 'dark' : 'light';
    this._colorMode.next(newMode);
    this.applyColorMode(newMode);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('chakra-ui-color-mode', newMode);
    }
  }

  private applyColorMode(mode: 'light' | 'dark'): void {
    if (typeof document !== 'undefined') {
      if (mode === 'dark') {
        this.renderer.addClass(document.body, 'chakra-ui-dark');
      } else {
        this.renderer.removeClass(document.body, 'chakra-ui-dark');
      }
    }
  }

  getColorModeValue<T>(lightValue: T, darkValue: T): T {
    return this._colorMode.value === 'light' ? lightValue : darkValue;
  }
}