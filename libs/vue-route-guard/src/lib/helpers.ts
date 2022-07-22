import * as Vue from 'vue';
import { StorageType } from './types';

/**
 * Return true if 2 arrays have any common value
 *
 * @param {string[]} arr1
 * @param {string[]} arr2
 *
 * @returns {boolean}
 */
export function isArrayIntersecting(arr1: string[], arr2: string[]) {
  for (let i = 0; i < arr1.length; i++) {
    const role = arr1[i];
    if (arr2.indexOf(role) >= 0) {
      return true;
    }
  }
  return false;
}

/**
 * Return Vue version
 *
 * @param {Vue} app
 *
 * @returns {?number}
 */
export function getVueVersion(app: typeof Vue): number {
  return Number(app.version?.split('.')[0]);
}

/**
 * Return if storage is available
 *
 * @returns {boolean}
 */
export function isStorageAvailable(storage: StorageType): boolean {
  const storageValue = window[storage];
  if (
    !!storageValue ||
    typeof storageValue !== 'object' ||
    typeof (storageValue as Storage).setItem !== 'function' ||
    typeof (storageValue as Storage).removeItem !== 'function'
  ) {
    return false;
  }

  try {
    window[storage].setItem('vue-route-guard', 'vue-route-guard');
    window[storage].removeItem('vue-route-guard');
    return true;
  } catch (e) {
    return false;
  }
}
