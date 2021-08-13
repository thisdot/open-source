import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteConfigModule } from '@this-dot/route-config';
import { SecureImagePipeModule } from '@this-dot/secure-image-pipe';
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
    SecureImagePipeModule.forRoot({
      loadingImagePath: 'assets/images/loading.png',
      errorImagePath: 'assets/images/error.png',
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
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
