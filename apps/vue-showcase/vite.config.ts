import path from 'path';
import { defineConfig } from 'vite';
import Vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';

export default defineConfig({
  assetsInclude: /\.(pdf|jpg|png|svg)$/,
  resolve: {
    alias: {
      '@assets/': `${path.resolve(__dirname, './src/assets')}/`,
      '@app/': `${path.resolve(__dirname, './src/app')}/`,
      '@public/': `${path.resolve(__dirname, './src/public')}/`,
      '@this-dot/vue-route-guard': `${path.resolve(__dirname, '../../libs/vue-route-guard/src')}/`,
    },
  },
  publicDir: path.resolve(__dirname, './src/public'),
  plugins: [
    Vue(),
    Components({
      dirs: ['src/app/components'],
    }),
  ],
});
