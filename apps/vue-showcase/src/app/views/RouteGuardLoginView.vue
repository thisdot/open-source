<template>
  <div class="route-guard-wrap">
    <div class="route-guard-wrap__title">
      <button class="route-guard-wrap__button" @click="saveToken">
        {{ $t('login') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGuard } from '../../../../../libs/vue-route-guard/src/index';
import { useRouter } from "vue-router";
const router = useRouter();

const auth = useGuard();

const saveToken = () => {
  auth.setToken({ token: "thisisatokenstring" }).then(() => {
    router.replace('/route-guard')
    console.log('Login successful');
  });
}
</script>
