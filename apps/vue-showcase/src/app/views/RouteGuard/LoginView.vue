<template>
  <div class="route-guard-wrap">
    <div class="route-guard-wrap__title">
      <button id="loginButton" class="route-guard-wrap__button" @click="saveToken">
        {{ $t('login') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGuard } from '@this-dot/vue-route-guard';
import { useRouter } from 'vue-router';
const router = useRouter();

const auth = useGuard();

const saveToken = () => {
  auth.setToken({ token: 'thisisatokenstring' }).then(() => {
    router.replace('/route-guard');
    console.log('Login successful');
  });
};
</script>
