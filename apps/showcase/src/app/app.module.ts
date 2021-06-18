import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteConfigModule } from '@this-dot/route-config';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GithubLogoComponent } from './components/logos/github-logo.component';
import { ThisDotLogoComponent } from './components/logos/this-dot-logo.component';

@NgModule({
  declarations: [AppComponent, ThisDotLogoComponent, GithubLogoComponent],
  imports: [
    BrowserModule,
    RouteConfigModule.forRoot(),
    AppRoutingModule,
    BrowserAnimationsModule,
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
