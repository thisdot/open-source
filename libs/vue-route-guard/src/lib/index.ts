import * as Vue from 'vue';

import Guard from './guard';
import { getVueVersion } from './helpers';
import { GuardConfig } from './types';

const packageKey = 'guard';

export function setupGuard(options: GuardConfig) {
  if (getVueVersion(Vue) < 2) {
    throw new Error('@thisdot/vue-route-guard: Vue 2 is not supported');
  }

  return new Guard(options, packageKey);
}

export function useGuard(): Guard {
  return Vue.inject(packageKey) as Guard;
}
