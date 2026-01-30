<template>
  <div class="addPgnModal">
    <div
      class="backdrop"
      @click="close"
    />
    <div class="contents">
      <header class="header">
        {{ title }}
      </header>
      <div class="body">
        <div class="bar">
          <div
            class="item"
            @click="openPgn"
          >
            <em class="icon mdi mdi-checkerboard" /> Open PGN from file System
          </div>
        </div>
        <div class="Textbox">
          <textarea
            v-model="pgnString"
            rows="15"
            cols="80"
            placeholder="or Input the PGN String here"
          />
        </div>
      </div>
      <footer class="footer">
        <button
          type="button"
          class="btn green"
          @click="openPGNFromString"
        >
          confirm
        </button>
        <button
          type="button"
          class="btn red"
          @click="close"
        >
          cancel
        </button>
      </footer>
    </div>
  </div>
</template>

<script>
import fs from 'fs'
import { mapGetters } from 'vuex'
import ffish from 'ffish'

export default {
  name: 'AddPgnModal',
  props: {
    title: {
      required: true,
      type: String
    }
  },
  data () {
    return {
      error: 'none',
      pgnString: ''
    }
  },
  computed: {
    ...mapGetters(['initialized', 'variantOptions'])
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
    close () {
      this.$emit('close')
    },
    async openPgn () {
      // Try IPC fallback: ask main process to show dialog (matches EngineModal pattern)
      let ipcRenderer
      try {
        // eslint-disable-next-line
        ipcRenderer = (typeof window !== 'undefined' && window.require) ? window.require('electron').ipcRenderer : require('electron').ipcRenderer
      } catch (e) {
        ipcRenderer = null
      }
      if (!ipcRenderer || !ipcRenderer.invoke) {
        console.log('File dialog not available')
        return
      }

      try {
        const res = await ipcRenderer.invoke('show-open-dialog', {
          title: 'Open PGN file',
          properties: ['openFile'],
          filters: [
            { name: 'PGN Files', extensions: ['pgn'] },
            { name: 'All Files', extensions: ['*'] }
          ]
        })
        const file = Array.isArray(res && res.filePaths) ? res.filePaths[0] : undefined
        if (file) {
          localStorage.PGNPath = JSON.stringify(file)
          this.openPGNFromPath(file)
        }
      } catch (err) {
        console.log(err)
      }
    },
    async openPGNFromPath (path) {
      fs.readFile(path, 'utf8', async (err, data) => {
        if (err) {
          return console.log(err)
        }

        // convert CRLF to LF
        data = data.replace(/\r\n/g, '\n')
        this.convertAndStorePgn(data)
        this.close()

        // Add the file path to saved games
        let ipcRenderer
        try {
          ipcRenderer = (typeof window !== 'undefined' && window.require) ? window.require('electron').ipcRenderer : require('electron').ipcRenderer
        } catch (e) {
          ipcRenderer = null
        }
        if (ipcRenderer) {
          try {
            await ipcRenderer.invoke('add-game-path', path)
          } catch (error) {
            console.error('Error adding game path:', error)
          }
        }
      })
    },
    openPGNFromString () {
      if (this.pgnString === '') {
        // when input empty, do nothing
      } else {
        // convert CRLF to LF
        const data = this.pgnString.replace(/\r\n/g, '\n')
        this.convertAndStorePgn(data)
        this.close()
      }
    },
    convertAndStorePgn (data) {
      const regex = /(?:\[.+ ".*"\]\r?\n)+\r?\n+(?:.+\r?\n)*/gm
      let games = []
      if (this.$store.getters.loadedGames) { // keep already loaded pgns
        games = this.$store.getters.loadedGames
      }
      let numOfUnparseableGames = 0
      let m
      const maxGames = 30 // stops afer parsing 30 games, since large pgns crash liGround. reason so far not clear
      let currentGameCount = 0
      while ((m = regex.exec(data)) !== null && currentGameCount !== maxGames) { // parses over all games in the selected pgn file or String and pushes them onto the games array
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
          // Store the original PGN text for comment extraction
          game.originalPGN = match
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
    }

  }
}
</script>

<style scoped>
.addPgnModal {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}
.backdrop {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, .3);
  z-index: -1;
}

.contents {
  min-width: 45%;
  min-height: 45%;
  display: flex;
  flex-direction: column;
  background: var(--second-bg-color);
  box-shadow: 2px 2px 20px 1px var(--second-bg-color);
  overflow-x: auto;
}

.header {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid var(--main-border-color);
  color: #4AAE9B;
  user-select: none;
}

.bar {
  background-color: var(--button-color);
}

.Textbox {
  padding: 10px;
  border-top: 1px solid var(--main-border-color);
}

.input {
  padding: 2px 3px;
  background: lightgrey;
  border: none;
  border-radius: 3px;
}

.footer {
  padding: 15px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid var(--main-border-color);
  user-select: none;
}

.btn {
  padding: 2px 3px;
  margin: 2px;
  border: none;
  border-radius: 2px;
  color: white;
  cursor: pointer;
}
.btn.red {
  background: #b22222;
}
.btn.green {
  background: #4AAE9B;
}
.item {
  padding-left: 16px;
  padding-right: 16px;
  padding-top: 1.5%;
  padding-bottom: 1.5%;
  display: inline-block;
  background-color: var(--button-color);
  color: white;
  font-size: 11px;
  text-decoration: none;
  text-align: center;
  cursor: pointer;
}
.item:hover {
  background-color: var(--hover-color);
}
.item.active {
  background-color: #00af89;
}
#pgnString {
  max-width: 75%;
  background-color: var(--second-bg-color);
  color: var(--main-text-color);
}
#pgnString::placeholder {
  color: var(--main-text-color);
}
.pgnStringDiv {
  padding-bottom: 1.5%;
}
</style>
