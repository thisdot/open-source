export type AppRouteConfigParams = 'title' | 'routeTags';

export type AppRouteTag = keyof typeof AppRouteTags;

export enum AppRouteTags {
  show = 'show',
}
