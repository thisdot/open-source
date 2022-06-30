import { InjectionToken } from '@angular/core';

/**
 * InjectionToken for loading image path
 */
export const THIS_DOT_LOADING_IMAGE_PATH = new InjectionToken<string>(
  'THIS_DOT_LOADING_IMAGE_PATH'
);

/**
 * InjectionToken for error image path
 */
export const THIS_DOT_ERROR_IMAGE_PATH = new InjectionToken<string>('THIS_DOT_ERROR_IMAGE_PATH');
