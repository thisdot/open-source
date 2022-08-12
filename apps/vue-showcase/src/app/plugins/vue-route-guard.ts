import { setupGuard } from '../../../../../libs/vue-route-guard/src/index';
import * as vue from 'vue';
import { Router } from 'vue-router';

export default (app: vue.App, router: Router) => {
  app.use(
    setupGuard({
      router: router,
      token: {
        name: 'VUEROUTEGUARD-TOKEN',
      },
      redirect: {
        noAuthentication: '/route-guard/login',
        clearAuthentication: '/route-guard/login',
        noPermission: '/route-guard/no-permission',
      },
      options: {
        fetchAuthentication: () => {
          return new Promise(function(resolve, _) {
            return resolve({
              firstName: 'Test',
              lastName: 'User',
              permission: ['user'],
            });
          });
        },
      },
    })
  );
};
