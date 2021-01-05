<template>
  <div id="inner">
    <div>
      <div class='main-grid'>
        
        <div>
          <div class="chessboard-grid">
            <pgn-browser id="pgnbrowser"/>
            <ChessGround id="chessboard" @onMove="showInfo" :orientation="orientation"/>
            <EvalBar id="evalbar" />
          </div>
          <br/>
          <div id="fen-field">FEN <input type="text" id="lname" name="lname" placeholder="fen position" v-on:change="checkValidFEN" :value="fen" size="60"></div>
          <PieceStyleSelector id="piece-style"/>
          <EvalPlot/>
        </div>
        <AnalysisView id="analysisview" v-on:move-to-start="moveToStart" v-on:move-to-end="moveToEnd" v-on:move-back-one="moveBackOne" v-on:move-forward-one="moveForwardOne" v-on:flip-board="flipBoard" :reset="resetAnalysis"/>
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
import GameInfo from './GameInfo.vue'

let ffish = null

export default {
  name: 'GameBoards',
  components: {
    AnalysisView,
    EvalBar,
    ChessGround,
    PieceStyleSelector,
    EvalPlot,
    PgnBrowser,
    GameInfo
  },
  beforeCreate () {
    console.log(`beforeCreate()`)
    new Module().then(loadedModule => {
      ffish = loadedModule
      console.log(`initialized ${ffish} ${loadedModule}`)
      let game = new ffish.Board()
      console.log(game.fen())
    })
  },
  data () {
    return {
      positionInfo: '',
      game: null,
      resetAnalysis: false,
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
    currentMove () {//this returns the current half-move or -1 at the start of the game
      let fen = this.$store.getters.fen
      for ( const move of this.moves) {
        if(move.fen == fen) {
          return move.ply-1
        }
      }
      return -1;
    }
  },
  methods: {
    moveToStart () { //this method returns to the starting point of the current line
      let board = new ffish.Board(this.variant)
      let startFen = board.fen()
      this.$store.dispatch('fen', startFen)
      console.log('moveToStart')
    },
    moveToEnd () {//this method moves to the last move of the current line
      console.log('moveToEnd')
      if(this.currentMove >= this.moves.length-1){
        return
      }
      this.$store.dispatch('fen', this.moves[this.moves.length - 1].fen)
    },
    moveBackOne () {//this method moves back one move in the current line
      console.log('moveBackone')
      let num = this.currentMove
      if (num == -1) {
        return
      }
      if (num == 0){
        let board = new ffish.Board(this.variant)
        let startFen = board.fen()
        this.$store.dispatch('fen', startFen)
        return
      }
      this.$store.dispatch('fen', this.moves[num-1].fen)
    },
    moveForwardOne () {//this method moves forward one move in the current line
      console.log('moveForwardOne')
      let num = this.currentMove
      if (num >= this.moves.length-1 ){
        return
      }
      if (num == -1) {
        this.$store.dispatch('fen', this.moves[0].fen)
        return
      }
      if(num == 0) {
        this.$store.dispatch('fen', this.moves[1].fen)
        return
      }
      this.$store.dispatch('fen', this.moves[num+1].fen)

    },
    flipBoard () {
      if (this.orientation === 'white') {
        console.log('orientation change to black')
        this.$store.dispatch('orientation', 'black')
        console.log('orientation in store: ' + this.orientation)
      } else {
        this.$store.dispatch('orientation', 'white')
      }
      console.log('flipBoard currentMove: ' + this.currentMove)
    },
    selectPocketPiece (piece) {
      this.$store.commit('selectPocketPiece', ['boardA', piece.type])
    },
    deselectPocketPieces () {
      this.$store.commit('selectPocketPiece', ['boardA', ''])
    },
    getBoardPos (event) {
      if (event.explicitOriginalTarget.className === 'cg-board' && this.selectedPockedPiece['boardA'] !== '') {
        // get click field
        var x = Math.floor(event.layerX / 40)
        var y = Math.floor(event.layerY / 40)
        // var stringPos = y * 9 + x

        var letters = {0: 'a', 1: 'b', 2: 'c', 3: 'd', 4: 'e', 5: 'f', 6: 'g', 7: 'h'}
        var pieceCode = Vue.methds.pieceTypeToShort(this.selectedPockedPiece['boardA'])

        pieceCode = {'type': pieceCode, 'color': this.turnColor.charAt(0)}
        this.$store.dispatch('insertPieceAtPosition', ['boardA', pieceCode, letters[x] + (8 - y)])
      } else {
        this.deselectPocketPieces()
      }
    },
    showInfo (event) {
      console.log(`showInfo: ${this.fen}`)
      //this.$store.dispatch('fen', event['fen'])
      console.log(`fen: ${this.$store.getters.fen}`)
      let newMove = event.history[event.history.length - 1]
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
    },
    
  }, 
  mounted () {  //EventListener für Keyboardinput, ruft direkt die jeweilige Methode auf
    window.addEventListener('keydown', (event) => {
    const keyName = event.key
    if (keyName == 'ArrowUp') {
      this.moveToStart()
    }
    if (keyName == 'ArrowDown') {
      this.moveToEnd()
    }
    if (keyName == 'ArrowLeft') {
      this.moveBackOne()
    }
    if (keyName == 'ArrowRight'){  
      this.moveForwardOne()
    }
    }, false)
  }
}
</script>

<style scoped>

input {
  font-size: 12pt;
  width: 600px;
}
#fen-field {
  margin-left: 48px;
}
#piece-style {
  margin-top: 10px;
  width: 300px;
  margin-left: 142px;
}
.main-grid {
  display: grid;
  grid-template-columns: auto auto;
}
.chessboard-grid {
  display: grid;
  grid-template-columns: 20% auto auto;
}
#pgnbrowser {
  min-width: 8em;
  margin: 0em 1em;
  border: 1px solid black;
  border-radius: 4px;
}
#chessboard {
  display: inline-block;
  margin: 0em 0em 1em 0em;
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
  margin: 0em 1em;
  float: center;
}

</style>
