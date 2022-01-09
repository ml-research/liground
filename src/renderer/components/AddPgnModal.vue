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
        this.close()
      })
    },
    openPGNFromString () {
      if (this.pgnString === '') {
        // alert('please enter a game String')
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
