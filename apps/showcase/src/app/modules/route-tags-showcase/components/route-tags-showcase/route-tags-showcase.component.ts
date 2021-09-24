import { Component } from '@angular/core';
import { AppRouteTags } from '../../../../route-config-params';

@Component({
  selector: 'this-dot-route-tags-showcase',
  templateUrl: './route-tags-showcase.component.html',
  styleUrls: ['./route-tags-showcase.component.css'],
})
export class RouteTagsShowcaseComponent {
  readonly AppRouteTags = AppRouteTags;
  customProp = 'customRouteTags';
}
