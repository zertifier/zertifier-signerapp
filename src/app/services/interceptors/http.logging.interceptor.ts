import {HttpEvent, HttpEventType, HttpHandlerFn, HttpRequest} from '@angular/common/http';
import {Observable, tap} from 'rxjs';

export function loggingInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  console.log(' --> Fetching:', req.method, req.urlWithParams, req.body ? req.body : '');
  return next(req).pipe(
    tap(event => {
      if (event.type === HttpEventType.Response) {
        console.log(' <-- Response:', req.urlWithParams, event.body);
      }
    }));
}
