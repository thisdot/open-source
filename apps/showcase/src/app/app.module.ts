import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UseHttpImageSourcePipeModule } from '@this-dot/ng-utils';
import { ROUTE_DATA_DEFAULT_VALUE, RouteConfigModule } from '@this-dot/route-config';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GithubLogoComponent } from './components/logos/github-logo.component';
import { ThisDotLogoComponent } from './components/logos/this-dot-logo.component';
import { AuthInterceptorService } from './services/auth-interceptor.service';

@NgModule({
  declarations: [AppComponent, ThisDotLogoComponent, GithubLogoComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouteConfigModule.forRoot(),
    UseHttpImageSourcePipeModule.forRoot({
      loadingImagePath: 'https://thisdot-open-source.s3.us-east-1.amazonaws.com/public/loading.png',
      errorImagePath: 'https://thisdot-open-source.s3.us-east-1.amazonaws.com/public/error.png',
    }),
    AppRoutingModule,
    BrowserAnimationsModule,
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true,
    },
    {
      provide: ROUTE_DATA_DEFAULT_VALUE,
      useValue: {
        title: 'Injected Default Title',
        someDefaultParam: 'test',
      },
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
