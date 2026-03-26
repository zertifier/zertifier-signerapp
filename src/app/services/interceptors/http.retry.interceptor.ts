import {HttpEvent, HttpHandlerFn, HttpRequest} from '@angular/common/http';
import {catchError, Observable, retry, throwError, timer} from 'rxjs';

const RETRY_MAX_COUNT = 2;
const RETRY_BASE_DELAY = 500;

export function retryInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  return next(req).pipe(
    retry({
      count: RETRY_MAX_COUNT,
      delay: (_error, retryCount) => {
        const delay = Math.pow(2, retryCount) * RETRY_BASE_DELAY;
        return timer(delay);
      }
    }),
    catchError(err => {
      console.error(` > Http call failed after 3 retry attempts! Url: ${req.urlWithParams}`, {cause: err})
      return throwError(() => err)
    })
  );
}
