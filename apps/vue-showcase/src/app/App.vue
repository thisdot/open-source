<template>
  <div class="showcase__app">
    <TopBar />
    <div class="showcase__app__body">
      <SideBar />
      <div class="showcase__app__body__main">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style lang="postcss">
@import '@assets/css/font.css';
@import '@assets/css/global.css';

html,
body {
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%;
  color: $text-main;
  background-color: white;
  * {
    box-sizing: border-box;
  }
}

.showcase__app {
  height: 100%;

  &__body {
    display: flex;

    &__main {
      flex: auto;
      padding: 30px;
    }
  }
}

a {
  text-decoration: none;
  color: unset;
}
</style>
