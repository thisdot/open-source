import { createRouter, createWebHistory } from 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    title?: string;
  }
}

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return new Promise((resolve, _reject) => {
        setTimeout(() => {
          resolve({ el: to.hash });
        }, 500);
      });
    }
    if (savedPosition) {
      return savedPosition;
    }
    if (to.meta.noScroll && from.meta.noScroll) {
      return {};
    }
    return { top: 0 };
  },
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('./views/HomeView.vue'),
      meta: { title: 'vue-showcase', requiresAuth: false },
    },
    {
      path: '/route-guard',
      name: 'RouteGuard',
      component: () => import('./views/RouteGuard/BaseView.vue'),
      meta: { title: 'vue-route-guard-view', requiresAuth: false },
      children: [
        {
          path: '/route-guard',
          name: 'RouteGuardHome',
          component: () => import('./views/RouteGuard/HomeView.vue'),
          meta: { title: 'vue-route-guard-home-view', requiresAuth: true },
        },
        {
          path: '/route-guard/login',
          name: 'RouteGuardLogin',
          component: () => import('./views/RouteGuard/LoginView.vue'),
          meta: { title: 'vue-route-guard-login-view', requiresAuth: false },
        },
        {
          path: '/route-guard/about',
          name: 'RouteGuardAbout',
          component: () => import('./views/RouteGuard/AboutView.vue'),
          meta: {
            title: 'vue-route-guard-about-view',
            requiresAuth: true,
            access: ['admin'],
          },
        },
        {
          path: '/route-guard/no-permission',
          name: 'RouteGuardNoPermission',
          component: () => import('./views/RouteGuard/NoPermissionView.vue'),
          meta: {
            title: 'vue-route-guard-no-permission-view',
            requiresAuth: false,
          },
        },
      ],
    },
  ],
});

router.afterEach((to, _from) => {
  const parent = to.matched.find((record) => record.meta.title);
  const parentTitle = parent ? parent.meta.title : null;

  document.title = to.meta.title || parentTitle || 'vue-showcase';
});

export default router;
