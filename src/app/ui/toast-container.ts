import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../services/ToastService';

@Component({
  selector: 'app-toast-container',
  template: `
    <div class="fixed bottom-4 right-4 z-[1000] space-y-3 pointer-events-none">
      @for (t of toastService.toasts(); track t.id) {
        <div
          role="status"
          aria-live="polite"
          class="pointer-events-auto flex w-80 max-w-[90vw] items-center rounded-lg p-4 shadow bg-white dark:bg-gray-800 border"
          [class]="t.type === 'success' ? 'border-green-200 dark:border-green-700' : (t.type === 'error' ? 'border-red-200 dark:border-red-700' : 'border-blue-200 dark:border-blue-700')"
        >
          <div class="me-3">
            @if (t.type === 'success') {
              <svg class="w-5 h-5 text-green-600 dark:text-green-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2A1 1 0 1 1 7.707 9.293L9 10.586l3.293-3.293a1 1 0 1 1 1.414 1.414Z"/></svg>
            } @else if (t.type === 'error') {
              <svg class="w-5 h-5 text-red-600 dark:text-red-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9 5a1 1 0 1 1 2 0v5a1 1 0 1 1-2 0V5Zm1 10a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Z"/></svg>
            } @else {
              <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9 9a1 1 0 1 1 2 0v5a1 1 0 1 1-2 0V9Zm1 6a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Z"/></svg>
            }
          </div>
          <div class="text-sm text-gray-800 dark:text-gray-100 flex-1 min-w-0 break-words whitespace-pre-line max-h-[50vh] overflow-y-auto">{{ t.message }}</div>
          <button type="button" class="ms-3 inline-flex items-center justify-center rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700" aria-label="Dismiss" (click)="toastService.dismiss(t.id)">
            <svg class="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/></svg>
          </button>
        </div>
      }
    </div>
  `,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainer {
  protected readonly toastService = inject(ToastService);
}
