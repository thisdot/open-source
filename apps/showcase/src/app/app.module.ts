import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteConfigModule } from '@this-dot/route-config';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, RouteConfigModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
