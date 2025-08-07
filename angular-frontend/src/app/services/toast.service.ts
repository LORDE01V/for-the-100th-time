import { Injectable } from '@angular/core';

interface ToastOptions {
  title?: string;
  description?: string;
  status?: 'success' | 'error' | 'warning' | 'info';
  duration?: number; // in ms, 0 for never
  isClosable?: boolean;
  position?: 'top' | 'top-right' | 'top-left' | 'bottom' | 'bottom-right' | 'bottom-left';
  render?: (onClose: () => void) => any; // For custom rendering
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor() { }

  // This is a simplified toast implementation. For a full-fledged solution
  // you would typically integrate a UI library like Angular Material's MatSnackBar
  // or PrimeNG's MessageService.
  show(options: ToastOptions): void {
    const toastElement = document.createElement('div');
    toastElement.classList.add('custom-toast', `toast-${options.status || 'info'}`);
    toastElement.style.position = 'fixed';
    toastElement.style.zIndex = '10000';
    toastElement.style.padding = '15px';
    toastElement.style.borderRadius = '8px';
    toastElement.style.backgroundColor = this.getToastBg(options.status);
    toastElement.style.color = 'white';
    toastElement.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    toastElement.style.display = 'flex';
    toastElement.style.flexDirection = 'column';
    toastElement.style.maxWidth = '300px';
    toastElement.style.left = '50%';
    toastElement.style.transform = 'translateX(-50%)';
    toastElement.style.top = options.position?.includes('top') ? '20px' : '';
    toastElement.style.bottom = options.position?.includes('bottom') ? '20px' : '';

    if (options.position?.includes('right')) {
      toastElement.style.left = '';
      toastElement.style.right = '20px';
      toastElement.style.transform = 'none';
    } else if (options.position?.includes('left')) {
      toastElement.style.left = '20px';
      toastElement.style.right = '';
      toastElement.style.transform = 'none';
    }

    const titleElement = document.createElement('strong');
    titleElement.textContent = options.title || '';
    if (options.title) toastElement.appendChild(titleElement);

    const descriptionElement = document.createElement('p');
    descriptionElement.textContent = options.description || '';
    if (options.description) toastElement.appendChild(descriptionElement);

    // Handle custom render function
    if (options.render) {
      const onClose = () => {
        toastElement.remove();
      };
      // For simplicity, just append text if render is a string or a simple element
      // A full implementation would require dynamically creating Angular components
      const customContent = options.render(onClose);
      if (typeof customContent === 'string') {
        const customText = document.createElement('div');
        customText.innerHTML = customContent;
        toastElement.appendChild(customText);
      } else if (customContent instanceof HTMLElement) {
        toastElement.appendChild(customContent);
      }
    }

    document.body.appendChild(toastElement);

    if (options.duration !== 0) {
      setTimeout(() => {
        toastElement.remove();
        // Call onCloseComplete if provided and applicable
        if (options.render && typeof options.render === 'function') {
          // In a real scenario, you'd need a way to trigger the onclosecomplete callback
        }
      }, options.duration || 3000);
    }

    if (options.isClosable) {
      const closeButton = document.createElement('button');
      closeButton.textContent = 'X';
      closeButton.style.marginLeft = 'auto';
      closeButton.style.background = 'none';
      closeButton.style.border = 'none';
      closeButton.style.color = 'white';
      closeButton.style.cursor = 'pointer';
      closeButton.onclick = () => toastElement.remove();
      toastElement.insertBefore(closeButton, titleElement);
    }
  }

  private getToastBg(status?: ToastOptions['status']): string {
    switch (status) {
      case 'success': return '#48BB78';
      case 'error': return '#E53E3E';
      case 'warning': return '#ED8936';
      case 'info': return '#3182CE';
      default: return '#A0AEC0'; // gray
    }
  }
}