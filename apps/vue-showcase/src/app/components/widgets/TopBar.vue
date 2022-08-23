<template>
  <div class="showcase-topbar">
    <AppLogo />
    <a href="https://github.com/thisdot/open-source">{{ $t('viewGithub') }}</a>
  </div>
</template>

<style lang="postcss" scoped>
.showcase-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: #2f3c4f;
  color: white;
  height: 77px;
  position: sticky;
  top: 0;
  box-shadow: 0px 2px 4px -1px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 14%),
    0px 1px 10px 0px rgb(0 0 0 / 12%);
}
</style>
