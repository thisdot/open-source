<template>
  <div class="route-guard-wrap">
    <div class="route-guard-wrap__title">
      {{ route.meta.title?.split('-').join(' ') }}
    </div>
    <nav class="route-guard-wrap__nav">
      <RouterLink to="/route-guard">
        {{ $t('home') }}
      </RouterLink>
      <RouterLink v-if="auth?.hasAuthenticationAccess(['admin', 'user'])" to="/route-guard/about">
        {{ $t('about') }}
      </RouterLink>
    </nav>
    <span class="route-guard-wrap__summary">
      {{ $t('documentationSummary') }}
      <a href="https://github.com/thisdot/open-source/tree/main/libs/vue-route-guard">{{
        $t('repoLink')
      }}</a>
    </span>

    <div class="route-guard-wrap__body">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useGuard } from '@this-dot/vue-route-guard';
const route = useRoute();
const auth = useGuard();
</script>

<style lang="postcss">
@import '../../../assets/css/global.css';

.route-guard-wrap {
  &__title {
    @mixin title 25px;
    text-transform: capitalize;
  }

  &__text {
    @mixin text 18px;
    border: 1px solid $text-main;
    padding: 20px;
  }

  &__button {
    @mixin button;
    margin-top: 30px;
  }

  &__nav {
    margin: 40px 0;

    a {
      padding: 10px 15px;
      border-radius: 6px;
      margin-right: 10px;
      @mixin text 16px;

      &.router-link-exact-active {
        color: #ec3835;
        background-color: #e0a7a7a4;
      }

      &:hover {
        background-color: #d5d5d5a4;
      }
    }
  }

  &__summary {
    a {
      text-decoration: underline;
    }
  }

  &__body {
    margin-top: 40px;
  }
}
</style>
