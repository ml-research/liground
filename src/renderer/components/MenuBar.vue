<template>
  <div>
    <nav>
      <a
        href="#"
        @click="openPgn"
      >
        <Checkerboard /> Open PGN
      </a>
      <a
        @click="showModal"
      >
        <Checkerboard /> Engines
      </a>
      <a
        href="#"
        :class="{ active: !viewAnalysis }"
        @click="changeTab"
      >
        <HammerScrewdriver /> Settings
      </a>
      <a
        href="#"
        @click="openExternalBrowser"
      >
        <InformationOutline /> About <Github />
      </a>
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
import Github from 'vue-material-design-icons/Github.vue'
import InformationOutline from 'vue-material-design-icons/InformationOutline.vue'
import HammerScrewdriver from 'vue-material-design-icons/HammerScrewdriver.vue'
import Checkerboard from 'vue-material-design-icons/Checkerboard.vue'

export default {
  name: 'MenuBar',
  components: {
    Modal, Github, InformationOutline, HammerScrewdriver, Checkerboard
  },
  data () {
    return {
      isModalVisible: false
    }
  },
  computed: {
    ...mapGetters(['viewAnalysis'])
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
