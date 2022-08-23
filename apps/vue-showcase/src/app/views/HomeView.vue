<template>
  <div class="home-wrap">
    <div class="home-title">
      {{ $t('title') }}
    </div>
    <AppLogo />
    <div class="home-generated-by" v-html="$t('generated')" />
  </div>
</template>

<style lang="postcss">
@import '../../assets/css/global.css';

.home-wrap {
  background-color: white;
  @mixin text 16px;
  @mixin flex-center-col;
  height: 100%;
  color: $text-main;

  .home-title {
    @mixin title 40px;
  }

  .home-generated-by {
    margin-top: 20px;
  }
}
</style>
