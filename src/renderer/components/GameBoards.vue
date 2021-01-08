<template>
  <div id="inner">
    <div>
      <div class="main-grid">
        <div class="chessboard-grid">
          <pgn-browser id="pgnbrowser" />
          <div @mousewheel.prevent="scroll($event)">
            <ChessGround
              id="chessboard"
              :orientation="orientation"
              @onMove="showInfo"
            />
          </div>
          <EvalBar id="evalbar" />
          <div id="fen-field">
            FEN <input
              id="lname"
              type="text"
              name="lname"
              placeholder="fen position"
              :value="fen"
              size="60"
              @change="checkValidFEN"
            >
            <PieceStyleSelector id="piece-style" />
          </div>
        </div>
        <EvalPlot id="evalplot" />
        <AnalysisView
          id="analysisview"
          :reset="resetAnalysis"
          @move-to-start="moveToStart"
          @move-to-end="moveToEnd"
          @move-back-one="moveBackOne"
          @move-forward-one="moveForwardOne"
          @flip-board="flipBoard"
        />
      </div>
    </div>
  </div>
</template>

<script>
import AnalysisView from './AnalysisView'
import EvalBar from './EvalBar'
import ChessGround from './ChessGround'
import EvalPlot from './EvalPlot'
import PieceStyleSelector from './PieceStyleSelector'
import Vue from 'vue'
import Module from 'ffish-es6'
import PgnBrowser from './PgnBrowser.vue'
// TODO: use GameInfo component?
// import GameInfo from './GameInfo.vue'

let ffish = null

export default {
  name: 'GameBoards',
  components: {
    AnalysisView,
    EvalBar,
    ChessGround,
    PieceStyleSelector,
    EvalPlot,
    // GameInfo,
    PgnBrowser
  },
  data () {
    return {
      positionInfo: '',
      game: null,
      resetAnalysis: false
    }
  },
  computed: {
    variant () {
      return this.$store.getters.variant
    },
    orientation () {
      return this.$store.getters.orientation
    },
    moves () {
      return this.$store.getters.moves
    },
    fen () {
      return this.$store.getters.fen
    },
    currentMove () { // this returns the current half-move or -1 at the start of the game
      const fen = this.$store.getters.fen
      for (const move of this.moves) {
        if (move.fen === fen) {
          return move.ply - 1
        }
      }
      return -1
    }
  },
  beforeCreate () {
    console.log('beforeCreate()')
    new Module().then(loadedModule => {
      ffish = loadedModule
      console.log(`initialized ${ffish} ${loadedModule}`)
      const game = new ffish.Board()
      console.log(game.fen())
    })
  },
  mounted () { // EventListener für Keyboardinput, ruft direkt die jeweilige Methode auf
    window.addEventListener('keydown', (event) => {
      const keyName = event.key
      if (keyName === 'ArrowUp') {
        this.moveToStart()
      }
      if (keyName === 'ArrowDown') {
        this.moveToEnd()
      }
      if (keyName === 'ArrowLeft') {
        this.moveBackOne()
      }
      if (keyName === 'ArrowRight') {
        this.moveForwardOne()
      }
    }, false)
  },
  methods: {
    scroll (event) { // also moves back and forth when being slightly next to the board and for example over the pockets
      if (event.deltaY < 0) {
        this.moveBackOne()
      } else {
        this.moveForwardOne()
      }
    },
    moveToStart () { // this method returns to the starting point of the current line
      const board = new ffish.Board(this.variant)
      const startFen = board.fen()
      this.$store.dispatch('fen', startFen)
    },
    moveToEnd () { // this method moves to the last move of the current line
      if (this.currentMove >= this.moves.length - 1) {
        return
      }
      this.$store.dispatch('fen', this.moves[this.moves.length - 1].fen)
    },
    moveBackOne () { // this method moves back one move in the current line
      const num = this.currentMove
      if (num === -1) {
        return
      }
      if (num === 0) {
        const board = new ffish.Board(this.variant)
        const startFen = board.fen()
        this.$store.dispatch('fen', startFen)
        return
      }
      this.$store.dispatch('fen', this.moves[num - 1].fen)
    },
    moveForwardOne () { // this method moves forward one move in the current line
      const num = this.currentMove
      if (num >= this.moves.length - 1) {
        return
      }
      if (num === -1) {
        this.$store.dispatch('fen', this.moves[0].fen)
        return
      }
      if (num === 0) {
        this.$store.dispatch('fen', this.moves[1].fen)
        return
      }
      this.$store.dispatch('fen', this.moves[num + 1].fen)
    },
    flipBoard () {
      if (this.variant === 'racingkings') {
        return
      }
      if (this.orientation === 'white') {
        this.$store.dispatch('orientation', 'black')
      } else {
        this.$store.dispatch('orientation', 'white')
      }
    },
    selectPocketPiece (piece) {
      this.$store.commit('selectPocketPiece', ['boardA', piece.type])
    },
    deselectPocketPieces () {
      this.$store.commit('selectPocketPiece', ['boardA', ''])
    },
    getBoardPos (event) {
      if (event.explicitOriginalTarget.className === 'cg-board' && this.selectedPockedPiece.boardA !== '') {
        // get click field
        const x = Math.floor(event.layerX / 40)
        const y = Math.floor(event.layerY / 40)
        // var stringPos = y * 9 + x

        const letters = { 0: 'a', 1: 'b', 2: 'c', 3: 'd', 4: 'e', 5: 'f', 6: 'g', 7: 'h' }
        let pieceCode = Vue.methds.pieceTypeToShort(this.selectedPockedPiece.boardA)

        pieceCode = { type: pieceCode, color: this.turnColor.charAt(0) }
        this.$store.dispatch('insertPieceAtPosition', ['boardA', pieceCode, letters[x] + (8 - y)])
      } else {
        this.deselectPocketPieces()
      }
    },
    showInfo (event) {
      console.log(`showInfo: ${this.fen}`)
      // this.$store.dispatch('fen', event['fen'])
      console.log(`fen: ${this.$store.getters.fen}`)
      // const newMove = event.history[event.history.length - 1]
      console.log(`event.history: ${event.history}`)

      if (this.$store.getters.active) {
        this.$store.dispatch('stopEngine')
        this.$store.dispatch('position')
        this.$store.dispatch('goEngine')
      }
    },
    drawArrow (event) {
      console.log(`event: ${event}`)
    },
    checkValidFEN (event) {
      if (ffish.validateFen(event.target.value, this.variant) === 1) {
        this.$store.dispatch('fen', event.target.value)
      } else {
        console.log(`invalid fen: ${event.target.value}`)
      }
      this.resetAnalysis = !this.resetAnalysis
    }

  }
}
</script>

<style scoped>
.main-grid {
  display: grid;
  grid-template-columns: 3fr 2fr;
  grid-template-rows: auto auto;
  gap: 1em 1em;
  grid-template-areas:
    "chessboard analysisview"
    "evalplot analysisview";
}
.main-grid > .chessboard-grid {
  grid-area: chessboard;
  display: grid;
  grid-template-columns: 20% auto auto;
  grid-template-rows: auto auto;
  gap: 1em;
  grid-template-areas:
    "pgnbrowser . ."
    "fenfield fenfield fenfield";
}
#analysisview {
  grid-area: analysisview;
}
input {
  font-size: 12pt;
  width: 600px;
}
#fen-field {
  grid-area: fenfield;
  /*margin-left: 48px;*/
}
#piece-style {
  margin-top: 10px;
  width: 300px;
  margin-left: 142px;
}
#pgnbrowser {
  grid-area: pgnbrowser;
  border: 1px solid black;
  border-radius: 4px;
  margin-left: 1em;
  max-height: 60vh;
}
#chessboard {
  display: inline-block;
}
.bottom-margin {
  margin-bottom: 1.5em;
}
#inner {
  display: table;
  margin: 0 auto;
}
#analysisview {
  margin-left: 15px;
}
#evalbar {
  float: left;
}
#evalplot {
  grid-area: evalplot;
}

</style>
