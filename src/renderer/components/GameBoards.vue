<template>
  <div id="inner">
    <div>
      <div class='grid-parent'>
        <div>
          <ChessGround id="chessboard" @onMove="showInfo" :orientation="orientation"/>
          <EvalBar class="float-right-child" id="evalbar"/>
          <br/>
          <div id="fen-field">FEN <input type="text" id="lname" name="lname" placeholder="fen position" v-on:change="checkValidFEN" :value="fen" size="60"></div>
          <PieceStyleSelector id="piece-style"/>
          <EvalPlot/>
        </div>
        <AnalysisView id="analysisview" v-on:flip-board="flipBoard" :reset="resetAnalysis"/>
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

let ffish = null

export default {
  name: 'GameBoards',
  components: {
    AnalysisView,
    EvalBar,
    ChessGround,
    PieceStyleSelector,
    EvalPlot
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
      orientation: 'white',
      game: null,
      resetAnalysis: false,
      moves: []
    }
  },
  computed: {
    variant () {
      return this.$store.state.variant
    },
    fen () {
      return this.$store.state.fen
    }
  },
  methods: {
    flipBoard () {
      if (this.orientation === 'white') {
        this.orientation = 'black'
      } else {
        this.orientation = 'white'
      }
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
      if (newMove !== undefined) {
        //this.moves.push({'ply': this.moves.length + 1, 'name': newMove})
        console.log(`newMove ${newMove}`)
        this.$store.dispatch('push', newMove)
      }
      console.log(`after newMove ${newMove}`)
      console.log(newMove)

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
.grid-parent {
  display: grid;
  grid-template-columns: auto auto auto auto
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
  margin-right: 20px;
  margin-left: -20px;
}

</style>
