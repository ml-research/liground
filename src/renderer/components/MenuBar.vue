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
        @click="showModal"
      ><em
        slot="extra"
        class="icon mdi mdi-checkerboard"
      /> Engines
      </a>
      <a
        href="#"
        :class="{ active: !viewAnalysis }"
        @click="changeTab"
      ><em
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
    </nav>
    <div id="Modal">
      <Modal
        v-show="isModalVisible"
        @close="closeModal"
      />
    </div>
  </div>
</template>

<script>
import fs from 'fs'
import ffish from 'ffish'
import Modal from './EngineModal'
import { mapGetters } from 'vuex'

export default {
  name: 'MenuBar',
  components: {
    Modal
  },
  data () {
    return {
      isModalVisible: false
    }
  },
  computed: {
    ...mapGetters(['viewAnalysis', 'initialized', 'variantOptions'])
  },
  watch: {
    initialized: function () {
      if (this.initialized === true) {
        if (localStorage.PGNPath) {
          this.openPGNFromPath(JSON.parse(localStorage.PGNPath))
        }
      }
    }
  },
  methods: {
    showModal () {
      this.isModalVisible = true
    },
    closeModal () {
      this.isModalVisible = false
    },
    changeTab () {
      this.$store.commit('viewAnalysis', !this.$store.getters.viewAnalysis)
    },
    openExternalBrowser () {
      const shell = require('electron').shell
      event.preventDefault()
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
        /* if (games[0]) {
          this.$store.dispatch('loadGame', { game: games[0] })
        } */
      })
    }
  }
}
</script>

<style scoped>
 nav {
  margin: 10px auto;
  position: relative;
  background-color: #34495e;
  font-size: 11px;
  width: 33.3%;
  border-radius: 8px;
}
nav a {
  display: inline-block;
  text-decoration: none;
  text-align: center;
  color: white;
  padding: 5px 16px;
  cursor: pointer;
}
a:hover:not(.active) {
  background-color: #22303d;
}
.active {
  background-color: #00af89;
}
</style>
