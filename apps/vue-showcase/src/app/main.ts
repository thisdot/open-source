import { createApp } from 'vue';
import App from './App.vue';
import i18n from './i18n';
import router from './router';
import routeGuard from './plugins/vue-route-guard';

createApp(App)
  .use(router)
  .use(i18n)
  .use((app) => routeGuard(app, router))
  .mount('#app');
