import {WritableSignal} from '@angular/core';
import {finalize, Observable} from 'rxjs';

export function requireValue<T>(value: T | null | undefined, name: string): T {
  if (value == null) {
    throw new Error(`${name} required but not found.`);
  }
  return value;
}

export function withLoading<T>(obs: Observable<T>, signal: WritableSignal<boolean>) {
  signal.set(true);
  return obs.pipe(
    finalize(() => signal.set(false))
  );
}
