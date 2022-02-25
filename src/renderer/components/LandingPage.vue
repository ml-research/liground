<template>
  <div class="page">
    <MenuBar id="menubar" />
    <GameBoards id="gameboards" />
  </div>
</template>

<script>
import GameBoards from './GameBoards'
import MenuBar from './MenuBar.vue'

export default {
  name: 'LandingPage',
  components: {
    MenuBar,
    GameBoards
  },
  methods: {
    open (link) {
      this.$electron.shell.openExternal(link)
    }
  }
}
</script>

<style>
@import '../assets/cssVars.css';

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body { font-family: Avenir, Helvetica, Arial, sans-serif; }

#app {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: var(--main-text-color, black);
  background-color: var(--main-bg-color, white);
  font-weight: 800;
  font-size: 12pt;
  overflow: auto;
}

#menubar {
  text-align: center;
  margin-bottom: 5px;
}
</style>
