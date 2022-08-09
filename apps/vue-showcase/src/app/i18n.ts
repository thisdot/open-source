import { createI18n, I18nOptions } from 'vue-i18n';

import en from './translations/en.json';

export default createI18n<I18nOptions, 'en'>({
  legacy: false,
  globalInjection: true,
  locale: 'en',
  fallbackLocale: import.meta.env.VITE_I18N_FALLBACK_LOCALE || 'en',
  messages: { en },
});
