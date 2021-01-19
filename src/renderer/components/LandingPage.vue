<template>
  <div id="app">
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

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body { font-family: Avenir, Helvetica, Arial, sans-serif; }

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background-color: #f9f9f9;
  font-weight: 800;
  font-size: 12pt;
  height: 100vh;
  width: 100vw;
}

#menubar {
  text-align: center;
  margin-bottom: 10px;
}
</style>
