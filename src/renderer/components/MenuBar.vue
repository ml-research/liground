<template>
  <div class="bar">
    <div
      class="item"
      :class="{ active: !viewAnalysis }"
      @click="changeTab"
    >
      <em class="icon mdi mdi-hammer-screwdriver" /> Settings
    </div>
    <div
      class="item"
      @click="openPgn"
    >
      <em class="icon mdi mdi-checkerboard" /> Open PGN
    </div>
    <div
      class="item"
      @click="startQuickTour"
    >
      <em class="icon mdi mdi-map-search" /> Quickguide
    </div>
    <QuicktourModal
      v-if="quicktourModal.visible"
      :title="quicktourModal.title"
      @close="quicktourModal.visible = false"
    />
    <div
      class="item"
      @click="openAboutTabModal"
    >
      <em class="icon mdi mdi-information-outline" /> About <em class="icon mdi mdi-github" />
    </div>
    <AboutTabModal
      v-if="modal.visible"
      :title="modal.title"
      @close="modal.visible = false"
    />
  </div>
</template>

<script>
import fs from 'fs'
import { mapGetters } from 'vuex'
import ffish from 'ffish'
import AboutTabModal from './AboutTabModal'
import QuicktourModal from './QuicktourModal'

export default {
  name: 'MenuBar',
  components: { AboutTabModal, QuicktourModal },
  data () {
    return {
      modal: {
        visible: false,
        title: '',
        save: () => {}
      },
      error: 'none',
      pgnString: '',
      quicktourModal: {
        visible: false,
        title: '',
        save: () => {}
      }
    }
  },
  computed: {
    ...mapGetters(['viewAnalysis', 'initialized', 'variantOptions'])
  },
  methods: {
    changeTab () {
      this.$store.commit('viewAnalysis', !this.viewAnalysis)
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
      fs.readFile(path, 'utf8', (err, data) => {
        if (err) {
          return console.log(err)
        }

        // convert CRLF to LF
        data = data.replace(/\r\n/g, '\n')
        this.convertAndStorePgn(data)
      })
    },
    convertAndStorePgn (data) {
      const regex = /(?:\[.+ ".*"\]\r?\n)+\r?\n+(?:.+\r?\n)*/gm
      let games = []
      if (this.$store.getters.loadedGames) {
        games = this.$store.getters.loadedGames
      }
      let numOfUnparseableGames = 0
      let m
      const maxGames = 30
      let currentGameCount = 0
      while ((m = regex.exec(data)) !== null && currentGameCount !== maxGames) {
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
          currentGameCount++
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
    },
    startQuickTour () {
      this.quicktourModal = {
        visible: true,
        title: 'Welcome to our Quickguide'
      }
    },
    openAboutTabModal () {
      this.modal = {
        visible: true,
        title: 'LiGround'
      }
    }
  }
}
</script>

<style scoped>
.bar {
  position: relative;
  background-color: var(--button-color);
  font-size: 11px;
  width: 100%;
  display: flex;
  justify-content: flex-end
}
.item {
  padding-left: 20px;
  padding-right: 20px;
  padding-top: 1px;
  padding-bottom: 1px;
  display: inline-block;
  color: var(--light-text-color);;
  font-size: 14px;
  cursor: pointer;
}
.item:hover {
  background-color: var(--hover-color);
}
.item.active {
  background-color: var(--menubar-activetab-color);
}
</style>
