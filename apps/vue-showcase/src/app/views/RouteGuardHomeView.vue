<template>
  <div class="route-guard-wrap">
    <div class="route-guard-wrap__text">
      {{ auth.$store.state.authentication }}
    </div>

    <button class="route-guard-wrap__button" @click="logout">
      {{ $t('logout') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useGuard } from '../../../../../libs/vue-route-guard/src/index';
const auth = useGuard();
const logout = () => {
  auth.clearAuthentication().then(()=> {
    console.log('Logout successful');
  });
}
</script>