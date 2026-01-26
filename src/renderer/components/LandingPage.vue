<template>
  <div class="page">
    <MenuBar id="menubar" />
    <GameBoards id="gameboards" />
  </div>
</template>

<script>
import ffish from 'ffish'
import GameBoards from './GameBoards'
import MenuBar from './MenuBar.vue'

export default {
  name: 'LandingPage',
  components: {
    MenuBar,
    GameBoards
  },
  mounted () {
    this.loadSavedGames()
  },
  methods: {
    async loadSavedGames () {
      const { ipcRenderer } = require('electron')
      try {
        const result = await ipcRenderer.invoke('load-saved-games')
        if (result.success && result.paths && result.paths.length > 0) {
          const games = []
          let gameId = 0
          for (const filePath of result.paths) {
            try {
              const fileResult = await ipcRenderer.invoke('read-pgn-file', filePath)
              if (fileResult.success) {
                console.log(`Parsing game from ${filePath}`)
                const game = ffish.readGamePGN(fileResult.content)
                game.id = gameId++
                game.supported = true
                game.filePath = filePath
                // Store the original PGN for comment extraction
                game.originalPGN = fileResult.content
                games.push(game)
              }
            } catch (error) {
              console.error(`Error loading game from ${filePath}:`, error)
            }
          }
          if (games.length > 0) {
            this.$store.dispatch('loadedGames', games)
            console.log(`Loaded ${games.length} saved games`)
          }
        }
      } catch (error) {
        console.error('Error loading saved games:', error)
      }
    },
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
