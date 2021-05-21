import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteConfigModule } from '@this-dot/route-config';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FirstRouteComponent } from './components/first-route/first-route.component';
import { SecondRouteComponent } from './components/second-route/second-route.component';

@NgModule({
  declarations: [AppComponent, FirstRouteComponent, SecondRouteComponent],
  imports: [BrowserModule, RouteConfigModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
