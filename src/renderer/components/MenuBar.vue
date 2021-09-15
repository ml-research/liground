<template>
  <div class="bar">
    <div
      class="item"
      @click="openPgn"
    >
      <em class="icon mdi mdi-checkerboard" /> Open PGN
    </div>
    <div
      class="item"
      :class="{ active: !viewAnalysis }"
      @click="changeTab"
    >
      <em class="icon mdi mdi-hammer-screwdriver" /> Settings
    </div>
        <div
      class="item"
      @click="addVariantsConfig"
    >
      <em class="icon mdi mdi-hammer" /> Custom Variants
    </div>

    <div
      class="item"
      @click="openExternalBrowser"
    >
      <em class="icon mdi mdi-information-outline" /> About <em class="icon mdi mdi-github" />
    </div>
  </div>
</template>

<script>
import fs from 'fs'
import { shell } from 'electron'
import { mapGetters } from 'vuex'
import ffish from 'ffish'

export default {
  name: 'MenuBar',
  computed: {
    ...mapGetters(['viewAnalysis', 'initialized', 'variantOptions'])
  },
  watch: {
    initialized () {
      if (this.initialized === true) {
        if (localStorage.PGNPath) {
          this.openPGNFromPath(JSON.parse(localStorage.PGNPath))
        }
      }
    }
  },
  methods: {
    changeTab () {
      this.$store.commit('viewAnalysis', !this.viewAnalysis)
    },
    openExternalBrowser () {
      shell.openExternal('https://github.com/ml-research/liground')
    },
    openPgn () {
      this.$electron.remote.dialog.showOpenDialog({
        title: 'Open PGN file',
        properties: ['openFile'],
        filters: [
          { name: 'PGN Files', extensions: ['pgn'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      }).then(result => {
        if (!result.canceled) {
          localStorage.PGNPath = JSON.stringify(result.filePaths[0])
          this.openPGNFromPath(result.filePaths[0])
        }
      }).catch(err => {
        console.log(err)
      })
    },
    addVariantsConfig () {
      this.$electron.remote.dialog.showOpenDialog({
        title: 'Open Variants.ini',
        properties: ['openFile'],
        filters: [
          { name: 'INI Files', extensions: ['ini'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      }).then(result => {
        if (!result.canceled) {
          localStorage.INIPath = result.filePaths[0]
          this.$store.commit('refreshVariants', result.filePaths[0])
        }
      }).catch(err => {
        console.log(err)
      })
    },
    openPGNFromPath (path) {
      const regex = /(?:\[.+ ".*"\]\r?\n)+\r?\n+(?:.+\r?\n)*/gm
      let games = []
      fs.readFile(path, 'utf8', (err, data) => {
        if (err) {
          return console.log(err)
        }

        // convert CRLF to LF
        data = data.replace(/\r\n/g, '\n')

        let numOfUnparseableGames = 0

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
              numOfUnparseableGames = numOfUnparseableGames + 1
              return
            }
            games.push(game)
          })
        }

        if (numOfUnparseableGames !== 0) {
          alert(numOfUnparseableGames + ' games could not be parsed.')
        }

        games = games.map((curVal, idx, arr) => {
          curVal.id = idx
          curVal.supported = this.variantOptions.revGet(curVal.headers('Variant').toLowerCase()) !== undefined || !curVal.headers('Variant')
          return curVal
        })

        this.$store.dispatch('loadedGames', games)
      })
    }
  }
}
</script>

<style scoped>
.bar {
  margin: 10px auto;
  position: relative;
  background-color: var(--button-color);
  font-size: 11px;
  width: 33.3%;
  border-radius: 8px;
}
.item {
  padding-left: 16px;
  padding-right: 16px;
  padding-top: 1.5%;
  padding-bottom: 1.5%;
  display: inline-block;
  color: #fff;
  font-size: 11px;
  text-decoration: none;
  text-align: center;
  cursor: pointer;
}
.item:hover {
  background-color: #22303d;
}
.item.active {
  background-color: #00af89;
}
</style>
