import { Component, ErrorHandler, Injectable, Inject, Optional, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Custom Error Handler to catch errors globally
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    console.error('An error occurred:', error);
    // You might want to log this error to an external service
    // or display a user-friendly message
  }
}

@Component({
  selector: 'app-error-boundary',
  templateUrl: './error-boundary.component.html',
  styleUrls: ['./error-boundary.component.scss']
})
export class ErrorBoundaryComponent {
  hasError: boolean = false;
  error: any = null;
  errorInfo: any = null;

  constructor(@Optional() @Inject(ErrorHandler) private errorHandler: ErrorHandler) {}

  // This method is not directly used by Angular's error handling mechanism
  // but serves as a placeholder for potential future component-level error handling logic
  // For global error handling, GlobalErrorHandler takes precedence.
  static getDerivedStateFromError(error: any): { hasError: boolean, error: any } {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any): void {
    console.error("Error caught by ErrorBoundary (Component):", error, errorInfo);
    this.hasError = true;
    this.error = error;
    this.errorInfo = errorInfo;
  }
}