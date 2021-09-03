import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { iif, Observable, of, timer } from 'rxjs';
import { catchError, delay, mapTo, tap } from 'rxjs/operators';

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

    return iif(
      () =>
        req.url.includes('assets/images/success.png') ||
        req.url.includes('assets/images/notfound.png'),
      next.handle(withHeader).pipe(
        delay(5000),
        catchError((e) =>
          timer(5000).pipe(
            mapTo(e),
            tap((e) => {
              throw e;
            })
          )
        )
      ),
      next.handle(withHeader)
    );
  }
}
