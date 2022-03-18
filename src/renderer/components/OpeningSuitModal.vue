<template>
  <div class="modal">
    <div
      class="backdrop"
      @click="cancel"
    />
    <div class="contents">
      <header class="header">
        {{ title }}
      </header>
      <section class="body">
        <div class="item">
          <span class="label">Select number between 1 and 30</span>
          <input
            v-model="number"
            class="input"
            type="text"
            size="2"
          >
        </div>
        <div class="item">
          <span class="label">Load custom Opening Suits</span>
          <button
            class="btn grey"
            @click="selectPath"
          >
            Open epd
          </button>
          <button
            class="btn grey"
            @click="openAddPgnModal"
          >
            Open pgn
          </button>
        </div>
        <div class="item">
          <span class="label">Select number from custom opening Suits</span>
          <input
            v-model="number2"
            class="input"
            type="text"
            size="2"
          >
        </div>
        <div>
          <AddPgnModal
            v-if="AddPgnModal.visible"
            :title="AddPgnModal.title"
            @close="AddPgnModal.visible = false"
          />
        </div>
      </section>
      <footer class="footer">
        <button
          type="button"
          class="btn"
          @click="confirm"
        >
          Confirm
        </button>
        <button
          type="button"
          class="btn"
          @click="cancel"
        >
          Close
        </button>
      </footer>
    </div>
  </div>
</template>

<script>

import fs from 'fs'
import AddPgnModal from './AddPgnModal'

export default {
  name: 'OpeningSuitModal',
  components: { AddPgnModal },
  props: {
    title: {
      required: true,
      type: String
    },
    initialNumber: {
      default: '',
      type: String
    }
  },
  data () {
    return {
      AddPgnModal: {
        visible: false,
        title: ''
      },
      number: this.initialNumber,
      number2: this.initialNumber,
      loadedCustom: 'false',
      fens: ['rnbqkbnr/pp2pppp/2pp4/8/8/1P1P1N2/P1P1PPPP/RNBQKB1R b KQkq - 0 1', 'rn1qkbnr/ppp1pppp/3pb3/8/4N3/2P5/PP1PPPPP/R1BQKBNR b KQkq - 0 1', '1rbqkbnr/pppppppp/2n5/8/1PP5/7N/P2PPPPP/RNBQKB1R b KQk - 0 1', 'rnbqkbnr/pppp1p1p/8/4p1p1/6P1/3P4/PPPBPP1P/RN1QKBNR b KQkq - 0 1', 'rnbqkbnr/1pp1pppp/p2p4/8/8/2N3PN/PPPPPP1P/R1BQKB1R b KQkq - 0 1', 'rnb1kbnr/pppp1ppp/4p3/8/1P1P3q/P7/2P1PPPP/RNBQKBNR b KQkq - 0 1', 'rnbqk1nr/pppppp1p/6pb/8/8/1P4P1/P1PPPPBP/RNBQK1NR b KQkq - 0 1', 'rnbqkbnr/pp1ppp1p/2p3p1/8/4P2P/N7/PPPP1PP1/R1BQKBNR b KQkq - 0 1', 'rn1qkbnr/pppbpppp/3p4/8/4P3/2NB4/PPPP1PPP/R1BQK1NR b KQkq - 0 1', 'r1bqkbnr/pp1ppppp/n1p5/8/2B5/4PQ2/PPPP1PPP/RNB1K1NR b KQkq - 0 1', 'rnbqkb1r/pppppppp/8/8/1P2n3/3BP3/P1PP1PPP/RNBQK1NR b KQkq - 0 1', 'rnbqkbnr/ppp2ppp/4p3/3p4/2P5/P3P3/1P1P1PPP/RNBQKBNR b KQkq - 0 1', 'rnbqkbnr/pp2pppp/8/2pp4/5B2/3P2P1/PPP1PP1P/RN1QKBNR b KQkq - 0 1', 'rnbqk1nr/pppp1ppp/4p3/1B6/1b2P1Q1/8/PPPP1PPP/RNB1K1NR b KQkq - 0 1', 'rnbqkb1r/pp1ppppp/5n2/2p5/8/1P4P1/P1PPPPBP/RNBQK1NR b KQkq - 0 1', 'rnbqkb1r/ppppppp1/5n2/6Bp/3P4/7P/PPP1PPP1/RN1QKBNR b KQkq - 0 1', 'rnbqk1nr/ppppbppp/4p3/8/6PP/P7/1PPPPP2/RNBQKBNR b KQkq - 0 1', 'rnbqkbnr/pppp1p1p/8/4p1p1/8/2PP2P1/PP2PP1P/RNBQKBNR b KQkq - 0 1', 'rn1qkbnr/ppp1pppp/3pb3/8/8/N5PP/PPPPPP2/R1BQKBNR b KQkq - 0 1', 'rnbqkb1r/1ppppppp/5n2/p7/4P3/N2B4/PPPP1PPP/R1BQK1NR b KQkq - 0 1', 'r1bqkbnr/pppp1ppp/n3p3/8/4N3/5N2/PPPPPPPP/R1BQKB1R b KQkq - 0 1', 'rnbqkbnr/p2ppppp/2p5/1p6/4N3/6P1/PPPPPP1P/R1BQKBNR b KQkq - 0 1', 'rnbqkbnr/ppp1ppp1/3p3p/8/Q1PP4/8/PP2PPPP/RNB1KBNR b KQkq - 0 1', 'rnbqk1nr/pppp1ppp/8/2b1p3/7P/4P1P1/PPPP1P2/RNBQKBNR b KQkq - 0 1', 'rnbqkb1r/pppppppp/8/8/4n3/1P2PN2/P1PP1PPP/RNBQKB1R b KQkq - 0 1', 'r1bqkbnr/pppp1ppp/2n1p3/8/3PP2P/8/PPP2PP1/RNBQKBNR b KQkq - 0 1', 'rnbqkbnr/ppp1ppp1/3p3p/8/2PN4/8/PP1PPPPP/RNBQKB1R b KQkq - 0 1', 'r1bqkbnr/pppnpppp/3p4/8/P7/N1P5/1P1PPPPP/R1BQKBNR b KQkq - 0 1', 'rnbqkbnr/1p1ppppp/p1p5/8/8/2NP3N/PPP1PPPP/R1BQKB1R b KQkq - 0 1', 'rnbqkbnr/ppppp2p/8/5pp1/Q2P4/2P5/PP2PPPP/RNB1KBNR b KQkq - 0 1']
    }
  },
  methods: {
    cancel () {
      this.$emit('close')
    },
    confirm () {
      if (this.loadedCustom === 'true') {
        this.number = this.number2
      }
      this.$store.state.fen = this.fens[this.number - 1]
      this.$store.dispatch('updateBoard')
      this.$store.dispatch('position')
      this.$emit('close')
    },
    selectPath () {
      this.$electron.remote.dialog.showOpenDialog({
        title: 'Open PGN file',
        properties: ['openFile'],
        filters: [
          { name: 'Epd Files', extensions: ['epd'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      }).then(result => {
        if (!result.canceled) {
          this.openFromPath(result.filePaths[0])
        }
      }).catch(err => {
        console.log(err)
      })
    },
    openFromPath (path) {
      fs.readFile(path, 'utf8', (err, data) => {
        if (err) {
          return console.log(err)
        }

        // convert CRLF to LF
        this.openFens(data)
      })
    },
    openFens (data) {
      let customFens = ''
      const str = data.toString()
      customFens = str.split(';')
      this.fens = customFens
      this.loadedCustom = 'true'
    },
    openAddPgnModal () {
      this.AddPgnModal = {
        visible: true,
        title: 'Add new PGN'
      }
    }
  }
}
</script>

<style scoped>
.modal {
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
  background-color: rgba(0, 0, 0, 0.3);
  z-index: -1;
}
.contents {
  display: flex;
  flex-direction: column;
  background: var(--second-bg-color);
  box-shadow: 2px 2px 20px 1px var(--second-bg-color);
  overflow-x: 10px;
}
.item {
  margin: 5px 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 1em;
}
.item > * {
  margin: 0 10px;
}
.header {
  font-size: 20px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid var(--main-border-color);
  color: var(--tab-header-color);
  user-select: none;
}
.footer {
  padding: 15px;
  display: flex;
  justify-content: center;
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
  background: var(--tab-btn-color);
}
</style>
