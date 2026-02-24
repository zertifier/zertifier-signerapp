import {Injectable, signal} from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastOptions {
  duration?: number; // ms
  id?: string;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
}

@Injectable({providedIn: 'root'})
export class ToastService {
  readonly toasts = signal<ToastItem[]>([]);
  #timers = new Map<string, any>();

  success(message: string, options?: ToastOptions) {
    this.show('success', message, options);
  }

  error(message: string, options?: ToastOptions) {
    this.show('error', message, options);
  }

  info(message: string, options?: ToastOptions) {
    this.show('info', message, options);
  }

  show(type: ToastType, message: string, options?: ToastOptions) {
    const id = options?.id ?? this.#uuid();
    const duration = options?.duration ?? 4000;
    const next: ToastItem = {id, type, message, duration};
    this.toasts.update(list => [next, ...list].slice(0, 6)); // cap to 6

    const timer = setTimeout(() => this.dismiss(id), duration);
    this.#timers.set(id, timer);
    return id;
  }

  dismiss(id: string) {
    const timer = this.#timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.#timers.delete(id);
    }
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  clear() {
    this.#timers.forEach(t => clearTimeout(t));
    this.#timers.clear();
    this.toasts.set([]);
  }

  #uuid() {
    // RFC4122-ish, sufficient for UI ids
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
