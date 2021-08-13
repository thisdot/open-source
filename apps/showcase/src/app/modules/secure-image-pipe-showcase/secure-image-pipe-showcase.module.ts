import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecureImagePipeModule } from '@this-dot/secure-image-pipe';

import { SecureImagePipeShowcaseRoutingModule } from './secure-image-pipe-showcase-routing.module';
import { SecureImagePipeShowcaseComponent } from './components/secure-image-pipe-showcase/secure-image-pipe-showcase.component';

@NgModule({
  declarations: [SecureImagePipeShowcaseComponent],
  imports: [CommonModule, SecureImagePipeModule, SecureImagePipeShowcaseRoutingModule],
})
export class SecureImagePipeShowcaseModule {}
