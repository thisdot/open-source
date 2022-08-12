<template>
  <div class="showcase__app__sidebar">
    <template v-for="(items, i) in sidebarItems" :key="i">
      <a :href="items.link">{{ items.title }}</a>
    </template>
  </div>
</template>

<script lang="ts" setup>
const sidebarItems = [
  {
    title: '@this-dot/vue-route-guard',
    link: '/route-guard/',
  },
];
</script>

<style lang="postcss" scoped>
.showcase__app__sidebar {
  display: flex;
  justify-content: space-between;
  padding: 20px;
  width: 100%;
  max-width: 220px;
  position: sticky;
  top: 77px;
  background-color: #e2e3e6;
  color: rgba(0, 0, 0, 0.87);
  height: calc(100vh - 77px);
}
</style>
