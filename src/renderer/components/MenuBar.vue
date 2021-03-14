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
      @click="modal = true"
    >
      <em class="icon mdi mdi-engine" /> Add Engine
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
      @click="openExternalBrowser"
    >
      <em class="icon mdi mdi-information-outline" /> About <em class="icon mdi mdi-github" />
    </div>
    <Modal
      v-if="modal"
      @close="modal = false"
      @save="addEngine"
    />
  </div>
</template>

<script>
import fs from 'fs'
import { shell } from 'electron'
import { mapGetters } from 'vuex'
import ffish from 'ffish'
import Modal from './EngineModal'

export default {
  name: 'MenuBar',
  components: { Modal },
  data () {
    return {
      modal: false
    }
  },
  computed: {
    ...mapGetters(['viewAnalysis', 'initialized'])
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
    openPGNFromPath (path) {
      const regex = /(?:\[.+ ".*"\]\r?\n)+\r?\n+(?:.+\r?\n)*/gm
      let games = []
      fs.readFile(path, 'utf8', (err, data) => {
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
      })
    },
    addEngine ({ name, path }) {
      console.log(name, path)
    }
  }
}
</script>

<style scoped>
.bar {
  margin: 10px auto;
  width: 33.3%;
  background-color: #34495e;
  border-radius: 8px;
}
.item {
  padding: 5px 16px;
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
