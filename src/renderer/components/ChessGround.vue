<template>
  <div class='blue merida is2d'>
    <div class='grid-parent'>
      <div class='pockets'>
        <div v-if="variant==='crazyhouse'">
          <ChessPocket id='chesspocket_top' color='black' :pieces='piecesB' @selection='dropPiece'/>
          <ChessPocket id='chesspocket_bottom' color='white' :pieces='piecesW' @selection='dropPiece'/>
        </div>
      </div>
      <div @mouseup='getBoardPos'>
        <div ref='board' class='cg-board-wrap' ></div>
      </div>
</div>
</div>
</template>

<script>
import {Chessground} from 'chessgroundx'
import ChessPocket from './ChessPocket'

//import Module from 'ffish-es6'

let ffish = null
const WHITE = true
const BLACK = false

export default {
  name: 'ChessGround',
  components: {
    ChessPocket
  },
  beforeCreate () {
    console.log(`beforeCreate`)
  },
  data () {
    return {
      ranks: ['1', '2', '3', '4', '5', '6', '7', '8'],
      files: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
      selectedPiece: null,
      piecesToIdx: {
      'P': 4,
      'N': 3,
      'B': 2,
      'R': 1,
      'Q': 0,
      'p': 0,
      'n': 1,
      'b': 2,
      'r': 3,
      'q': 4
    },
    board: null,
    promotions: [],
    promoteTo: 'q'
    }
    
  },
  props: {
    free: {
      type: Boolean,
      default: false
    },
    onPromotion: {
      type: Function,
      default: () => 'q'
    },
    orientation: {
      type: String,
      default: 'white'
    },
    colors: {
      type: Array,
      default: () => (['w', 'b'])
    },
    piecesW: {
      type: Array,
      default: () => ([
        {'count': 0, 'type': 'queen'},
        {'count': 0, 'type': 'rook'},
        {'count': 0, 'type': 'bishop'},
        {'count': 0, 'type': 'knight'},
        {'count': 0, 'type': 'pawn'}
      ])
    },
    piecesB: {
      type: Array,
      default: () => ([
        {'count': 0, 'type': 'pawn'},
        {'count': 0, 'type': 'knight'},
        {'count': 0, 'type': 'bishop'},
        {'count': 0, 'type': 'rook'},
        {'count': 0, 'type': 'queen'}
      ])
    }
  },
  computed: {
    turn () {
      return this.$store.getters.turn
    },
    variant () {
      return this.$store.getters.variant
    },
    multipv () {
      return this.$store.getters.multipv
    },
    bestmove () {
      return this.$store.getters.bestmove
    },
    redraw () {
      return this.$store.getters.redraw
    },
    pieceStyle () {
      return this.$store.getters.pieceStyle
    },
    fen () {
      return this.$store.getters.fen
    }
  },
  watch: {
    turn: function(turn) {
      this.board.set({
        turnColor: this.toColor(),
        movable: {
          color: this.toColor()
        }
      })
    },
    pieceStyle: function (pieceStyle) {
      this.updatePieceCSS(pieceStyle)
    },
    bestmove: function () {
      let shapes = []
      const multipv = this.$store.getters.multipv

      if (this.$store.getters.started) {
        let lineWidth = 10
        for (let idx = 0; idx < multipv.length; ++idx) {
          if ('ucimove' in multipv[idx]) {
            const move = multipv[idx].ucimove
            const orig = move.substring(0, 2)
            const dest = move.substring(2, 4)
            let drawShape

            if (move.indexOf('@') !== -1) {
              const colorConv = ['black', 'white']
              const pieceType = move[0].toLowerCase()
              const pieceConv = {'p': 'pawn', 'n': 'knight', 'b': 'bishop', 'r': 'rook', 'q': 'queen', 'k': 'king'}
              shapes.unshift({ orig: dest, dest: dest, brush: 'blue', modifiers: { lineWidth: lineWidth }, piece: { role: pieceConv[pieceType], color: colorConv[+/*this.ffishBoard.turn()*/this.$store.getters.turn] } })
              drawShape = { orig: dest, brush: 'blue', modifiers: { lineWidth: lineWidth } }
            } else {
              drawShape = { orig: orig, dest: dest, brush: 'blue', modifiers: {lineWidth: lineWidth} }
            }
            if (idx === 0) {
              drawShape.brush = 'yellow'
            }
            // put item in front of list, so that the bestmove is drawn last
            shapes.unshift(drawShape)

            lineWidth -= 2
          }
        }
      }
      if (this.board !== null) {
        this.board.setShapes(shapes)
      }
    },
    orientation: function (orientation) {
      this.orientation = orientation
      this.loadPosition()
    },
    fen: function () {
      console.log('fen watcher')
      this.loadPosition()
    }
  },
  methods: {
    updatePieceCSS (pieceStyle) {
      let file = document.createElement('link')
      file.rel = 'stylesheet'
      file.href = 'src/renderer/assets/images/piece-css/' + pieceStyle + '.css'
      document.head.appendChild(file)
    },
    getBoardPos (event) {
      if (this.selectedPiece !== null) {
        // get click field
        const squareHeight = 75
        const squareWidth = 75
        let x = Math.floor(event.layerX / squareWidth)
        let y = Math.floor(event.layerY / squareHeight)
        console.log(`x, y: ${x} ${y}`)

        let pieces = {'pawn': 'P', 'knight': 'N', 'bishop': 'B', 'rook': 'R', 'queen': 'Q'}

        let letters = {0: 'a', 1: 'b', 2: 'c', 3: 'd', 4: 'e', 5: 'f', 6: 'g', 7: 'h'}
        const dstSquare = letters[x] + String(7 - y + 1)
        const move = pieces[this.selectedPiece] + '@' + dstSquare
        console.log(`move: ${move}`)
        this.$store.commit('push', move)
        //this.ffishBoard.push(move)
        /*this.board.set({
          fen: this.fen, //this.ffishBoard.fen(),
          turnColor: this.toColor(),
          movable: {
            color: this.toColor(),
            dests: this.possibleMoves()
          }
        })*/
        this.selectedPiece = null
      }
    },
    dropPiece (event, pieceType, color) {
      this.board.dragNewPiece({role: pieceType, color: color, promoted: false}, event)
      this.selectedPiece = pieceType
      console.log(`dropPiece: ${event} ${pieceType} ${color}`)
      console.log(`dropPiece: ${this.board.getFen()}`)
    },
    possibleMoves () {
      let dests = {}
      let legalMoves = this.$store.getters.legalMoves.split(' ')//this.ffishBoard.legalMoves().split(' ')

      let fromSq
      let toSq
      for (var i = 0; i < legalMoves.length; i++) {
        // don't include dropping moves
        if (legalMoves[i].length !== 3) {
          fromSq = legalMoves[i].substring(0, 2)
          toSq = legalMoves[i].substring(2, 4)
        }
        if (fromSq in dests) {
          dests[fromSq].push(toSq)
        } else {
          dests[fromSq] = [toSq]
        }
      }
      return dests
    },
    toColor () {
      return /*this.ffishBoard.turn() */this.turn ? 'white' : 'black'
    },
    isPromotion (orig, dest) {
      let filteredPromotions = this.promotions.filter(move => move.from === orig && move.to === dest)
      return filteredPromotions.length > 0 // The current movement is a promotion
    },
    resetPockets (pieces) {
      for (let idx = 0; idx < pieces.length; idx++) {
        pieces[idx]['count'] = 0
      }
    },
    changeTurn () {
      return (orig, dest) => {
        if (this.isPromotion(orig, dest)) {
          this.promoteTo = this.onPromotion()
        }
        const uciMove = orig + dest
        this.lastMoveSan = this.$store.getters.sanMove(uciMove)//this.ffishBoard.sanMove(uciMove)
        this.$store.commit('push', uciMove)//this.ffishBoard.push(uciMove)
        console.log('colorAfterPush:' + this.toColor())
        this.updateHand()

        /*this.board.set({
          fen: this.fen, //this.ffishBoard.fen(),
          turnColor: this.toColor(),
          movable: {
            color: this.toColor(),
            dests: this.possibleMoves()
          }
        })*/
        this.afterMove() 
      }
    },
    updatePocket (pocket, pocketPieces, color) {
      for (let idx = 0; idx < pocketPieces.length; ++idx) {
        let pieceIdx
        if (color === WHITE) {
          pieceIdx = this.piecesToIdx[pocketPieces[idx].toUpperCase()]
        } else {
          pieceIdx = this.piecesToIdx[pocketPieces[idx]]
        }
        pocket[pieceIdx]['count'] += 1
      }
    },
    updateHand () {
      // Crazyhouse pocket pieces
      this.resetPockets(this.piecesW)
      this.resetPockets(this.piecesB)
      this.updatePocket(this.piecesW, this.$store.getters.pocket(WHITE), WHITE)//this.ffishBoard.pocket(WHITE), WHITE)
      this.updatePocket(this.piecesB, this.$store.getters.pocket(BLACK), BLACK) //this.ffishBoard.pocket(BLACK), BLACK)
    },
    afterMove () {
      let events = {}
      events['fen'] = this.fen //this.ffishBoard.fen()

      events['history'] = [this.lastMoveSan]
      //console.log(`this.ffishBoard.moveStack(): ${this.ffishBoard.moveStack()}`)
      this.$emit('onMove', events)
      console.log('turn:'+ this.$store.getters.turn)
    },
    loadPosition () { // set a default value for the configuration object itself to allow call to loadPosition()
     this.board.set({
       fen: this.fen,
       turnColor: this.toColor(),
       movable:{
         dests: this.possibleMoves(),
         color: this.toColor()
       },
       orientation: this.orientation
     })
    }
  },
   mounted () {
    this.board = Chessground(this.$refs.board, {
        coordinates: false,
        fen: this.fen,
        turnColor: 'white',
        highlight: {
          lastMove: true, // add last-move class to squares
          check: false // add check class to squares
        },
        drawable: {
          enabled: true, // can draw
          visible: true, // can view
          eraseOnClick: false
        },
        movable: {
          events: { after: this.changeTurn() } ,
          color: 'white',
          free: false,
        },
        orientation: this.orientation
      })
  }
}
</script>

<style>
@import '../assets/chessground.css';
@import '../assets/theme.css';

.chess-pocket {
  float: left;
  background-color: #000;
}
.grid-parent {
  display: grid;
  grid-template-columns: auto 1fr
}
.pockets {
  margin-right: 1.5px;
}
coords.ranks {
  height: 100%;
  width: .8em;
  margin-bottom: 10px;
}
coords.files {
  height: 100%;
  width: .8em;
  width: 10px;
  padding-left: 30px;
  margin-right: 10px;
}
coords {
  text-shadow: var(--cg-coord-shadow);
  font-size: calc(8px + 4 * ((100vw - 320px) / 880));
  display: flex;
  color: #fff;
  text-shadow: 0 1px 2px #000;
  font-weight: bold;
}
.coords {
  margin-right: 1.5px;
  text-align: center;
  font-size: 8px;
  width: 10px;
  padding: 0px 0px 0px 0px;
  color: black;
}
.cg-board-wrap {
  border-radius: 4px 4px 4px 4px;
}
.cg-wrap {
  width: 600px;
  height: 600px;
  position: relative;
  display: block;
}
</style>
