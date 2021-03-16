<template>
  <div id="inner">
    <div>
      <div class="main-grid">
        <div class="chessboard-grid">
          <PgnBrowser id="pgnbrowser" />
          <div class="board">
            <div @mousewheel.prevent="scroll($event)">
              <ChessGround
                id="chessboard"
                :orientation="orientation"
                @onMove="showInfo"
              />
            </div>
            <EvalBar class="evalbar" />
          </div>
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
          </div>
          <div id="selector-container">
            <PieceStyleSelector id="piece-style" />
            <BoardStyleSelector id="board-style" />
            <EvalPlotButton id="evalbutton-style" />
          </div>
        </div>
        <EvalPlot id="evalplot" />
        <div id="right-column">
          <AnalysisView
            id="analysisview"
            class="tab"
            :class="{ visible: viewAnalysis }"
            :reset="resetAnalysis"
            @move-to-start="moveToStart"
            @move-to-end="moveToEnd"
            @move-back-one="moveBackOne"
            @move-forward-one="moveForwardOne"
            @flip-board="flipBoard"
          />
          <SettingsTab
            id="settingstab"
            class="tab"
            :class="{ visible: !viewAnalysis }"
          />
        </div>
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
import BoardStyleSelector from './BoardStyleSelector'
import Vue from 'vue'
import PgnBrowser from './PgnBrowser.vue'
import SettingsTab from './SettingsTab'
import EvalPlotButton from './EvalPlotButton'
// TODO: use GameInfo component?
// import GameInfo from './GameInfo.vue'

export default {
  name: 'GameBoards',
  components: {
    AnalysisView,
    EvalBar,
    ChessGround,
    PieceStyleSelector,
    BoardStyleSelector,
    EvalPlot,
    // GameInfo,
    PgnBrowser,
    SettingsTab,
    EvalPlotButton
  },
  data () {
    return {
      positionInfo: '',
      game: null,
      resetAnalysis: false
    }
  },
  computed: {
    viewAnalysis () {
      return this.$store.getters.viewAnalysis
    },
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
    mainFirstMove () {
      return this.$store.getters.mainFirstMove
    },
    startFen () {
      return this.$store.getters.startFen
    },
    currentMove () { // returns undefined when the current fen doesnt match a move from the history, otherwise it returns move from the moves array that matches the current fen
      for (let num = 0; num < this.moves.length; num++) { // beware that it matches by current FEN, not the one after dispatching a new one
        if (this.moves[num].fen === this.fen) {
          return this.moves[num]
        }
      }
      return undefined
    }
  },
  mounted () { // EventListener für Keyboardinput, ruft direkt die jeweilige Methode auf
    window.addEventListener('keydown', (event) => {
      const keyName = event.key
      if (event.target.nodeName.toLowerCase() !== 'input') {
        if (keyName === 'ArrowUp') {
          event.preventDefault()
          this.moveToStart()
        }
        if (keyName === 'ArrowDown') {
          event.preventDefault()
          this.moveToEnd()
        }
        if (keyName === 'ArrowLeft') {
          event.preventDefault()
          this.moveBackOne()
        }
        if (keyName === 'ArrowRight') {
          event.preventDefault()
          this.moveForwardOne()
        }
      }
    }, false)
  },
  methods: {
    scroll (event) { // TODO: also moves back and forth when being slightly next to the board and for example over the pockets
      if (event.deltaY < 0) {
        this.moveBackOne()
      } else {
        this.moveForwardOne()
      }
    },
    moveToStart () { // this method returns to the starting point of the current line
      this.$store.dispatch('fen', this.startFen)
    },
    moveToEnd () { // this method moves to the last move of the current line
      const mov = this.currentMove
      let endOfLine = mov
      if (!mov && this.moves.length === 0) {
        return
      } else if (!mov && this.moves.length > 0) {
        endOfLine = this.mainFirstMove
        while (endOfLine.main) {
          endOfLine = endOfLine.main
        }
      } else {
        endOfLine = mov
        while (endOfLine.main) {
          endOfLine = endOfLine.main
        }
      }
      this.$store.dispatch('fen', endOfLine.fen)
    },
    moveBackOne () { // this method moves back one move in the current line
      const mov = this.currentMove
      if (!mov) {
        return
      }
      if (mov.ply === 1) {
        this.$store.dispatch('fen', this.startFen)
        return
      }
      this.$store.dispatch('fen', mov.prev.fen)
    },
    moveForwardOne () { // this method moves forward one move in the current line
      const mov = this.currentMove
      if (!mov) {
        if (this.moves[0]) {
          this.$store.dispatch('playAudio', this.moves[0].name)
          this.$store.dispatch('fen', this.moves[0].fen)
        }
        return
      }
      if (!mov.main) {
        return
      }
      this.$store.dispatch('playAudio', mov.main.name)
      this.$store.dispatch('fen', mov.main.fen)
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
      console.log(`fen: ${this.$store.getters.fen}`)
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
      this.$store.dispatch('fen', event.target.value)
      this.resetAnalysis = !this.resetAnalysis
    }
  }
}
</script>

<style scoped>
.main-grid {
  display: grid;
  grid-template-columns: auto auto;
  grid-template-rows: auto auto;
  grid-template-areas:
    "chessboard analysisview"
    "evalplot analysisview";
}
.chessboard-grid {
  min-width: 925px;
  grid-area: chessboard;
  display: grid;
  grid-template-columns: 20% auto;
  grid-template-rows: auto auto auto;
  grid-template-areas:
    "pgnbrowser ."
    ". fenfield"
    ". selector";
}
#analysisview {
  height: 100%;
  width: 100%;
}
#right-column {
  grid-area: analysisview;
  width: 40vw;
  max-height: calc(100vh - 25px);
}
.tab:not(.visible) {
  display: none;
}
input {
  font-size: 12pt;
  max-width: 60vw;
}
#fen-field {
  grid-area: fenfield;
  /*margin-left: 48px;*/
}
#lname {
  background-color: var(--second-bg-color);
  color: var(--main-text-color)
}
#selector-container {
  grid-area: selector;
  display: flex;
  justify-content: space-around;
  height: 60px;
}
#piece-style {
  margin-top: 10px;
  width: 210px;
}
#board-style {
  margin-top: 10px;
  width: 210px;
}
#pgnbrowser {
  grid-area: pgnbrowser;
  border: 1px solid black;
  border-radius: 4px;
  margin-left: 1em;
  max-height: 60vh;
}
.board {
  display: flex;
  flex-direction: row;
  justify-content: center;
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
.evalbar {
  margin-left: 8px;
}
#analysisview {
  margin-left: 15px;
}
#evalplot {
  grid-area: evalplot;
}
#evalbutton-style {
  margin-top: 10px;
}

</style>
<style>
.multiselect * {
  color: var(--main-text-color, white) !important;
  background-color: var(--second-bg-color, white) !important;
  border-color: var(--main-border-color, white) !important;
}
.multiselect ::placeholder {
  color: var(--main-text-color) !important;
  opacity: 0.5;
}
.multiselect__select {
  border-radius: 5px;
  right: 2px;
  top: 2px;
  height: 36px;
}

.v-table-header-wrap *,
.v-table-body * {
  background-color: var(--second-bg-color, white) !important;
  color: var(--main-text-color, black) !important;
  border-color: var(--main-border-color, white) !important;
}
.v-table-dynamic * ,
.v-table:before{
  border-color: var(--main-border-color, white) !important;
}
::-webkit-scrollbar {
  width: 15px;
  height: 15px;
}
::-webkit-scrollbar-track{
  background: var(--scroll-track-color);
}
::-webkit-scrollbar-thumb {
  background: var(--scroll-thumb-color);
  border-radius: 8px;
}
::-webkit-scrollbar-corner {
  background: var(--main-bg-color);
  border-radius: 8px;
}

</style>
