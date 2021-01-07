<template>
  <div>
    <nav>
      <a
        href="#"
        @click="openPgn"
      ><em
        slot="extra"
        class="icon mdi mdi-checkerboard"
      /> Open PGN</a>
      <a
        @click=<Popup />><em
        slot="extra"
        class="icon mdi mdi-hammer-screwdriver"
      /> Engines </a> />
      <a href="#"><em
        slot="extra"
        class="icon mdi mdi-hammer-screwdriver"
      /> Settings </a>
      <a
        href="#"
        @click="openExternalBrowser"
      ><em
        slot="extra"
        class="icon mdi mdi-information-outline"
      /> About <em
        slot="extra"
        class="icon mdi mdi-github"
      /></a>
      <div class="animation start-home" />
    </nav>
  </div>
</template>

<script>
import fs from 'fs'
import ffish from 'ffish'
import Popup from './Popup'

export default {
  name: 'MenuBar',
  components: {
    Popup
  },
  methods: {
    goToEngines () {
      this.$router.push('LPE')
    },
    openExternalBrowser () {
      const shell = require('electron').shell
      event.preventDefault()
      shell.openExternal('https://github.com/ml-research/liground')
    },
    openPgn () {
      const regex = /(?:\[.+ ".*"\]\r?\n)+\r?\n+(?:.+\r?\n)*/gm
      let games = []
      this.$electron.remote.dialog.showOpenDialog({
        title: 'Open PGN file',
        properties: ['openFile'],
        filters: [
          { name: 'PGN Files', extensions: ['pgn'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      }).then(result => {
        if (!result.canceled) {
          fs.readFile(result.filePaths[0], 'utf8', (err, data) => {
            if (err) {
              return console.log(err)
            }

            let m
            while ((m = regex.exec(data)) !== null) {
              if (m.index === regex.lastIndex) {
                regex.lastIndex++
              }

              m.forEach((match, groupIndex) => {
                let game
                try {
                  game = ffish.readGamePGN(match)
                } catch (error) {
                  alert('Could not parse PGN.')
                  return
                }
                games.push(game)
              })
            }

            games = games.map((curVal, idx, arr) => {
              curVal.id = idx
              return curVal
            })
            this.$store.dispatch('loadedGames', games)
            if (games[0]) {
              this.$store.dispatch('loadGame', { game: games[0] })
            }
          })
        }
      }).catch(err => {
        console.log(err)
      })
    }
  }
}
</script>

<style scoped>
 nav {
  margin: 10px auto 0;
  position: relative;
  width: 500px;
  height: 20px;
  background-color: #34495e;
  border-radius: 8px;
  font-size: 11px;
}
nav a {
  line-height: 10px;
  /* height: 100%; */
  height: 20px;
  font-size: 8px;
  display: inline-block;
  position: relative;
  z-index: 1;
  text-decoration: none;
  text-align: center;
  color: white;
  cursor: pointer;
}

a:nth-child(1) {
  width: 100px;
}
a:nth-child(2) {
  width: 100px;
}
a:nth-child(3) {
  width: 100px;
}
a:nth-child(4) {
  width: 100px;
}
a:nth-child(5) {
  width: 100px;
}
a:hover {
  color: #688cb0;
}
</style>
