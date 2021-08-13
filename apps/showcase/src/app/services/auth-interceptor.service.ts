import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthInterceptorService implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const withHeader = req.clone({
      setHeaders: {
        Authorization: `Bearer this-should-be-a-token`,
      },
    });
    return next.handle(withHeader).pipe(
      delay(5000),
      catchError((e) =>
        of(e).pipe(
          delay(5000),
          tap((e) => {
            throw e;
          })
        )
      )
    );
  }
}
