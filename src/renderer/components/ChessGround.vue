<template>
  <div class='blue merida is2d'>
    <div class='grid-parent'>
      <div class='pockets'>
        <div v-if="variant==='crazyhouse'" v-bind:class='{ black : $store.getters.orientation == "black"}'>
          <ChessPocket id='chesspocket_top' color='black' :pieces='piecesB' @selection='dropPiece' v-bind:class='{ black : $store.getters.orientation == "white" }'/>
          <ChessPocket id='chesspocket_bottom' color='white' :pieces='piecesW' @selection='dropPiece' v-bind:class='{ black : $store.getters.orientation == "black" }' />
        </div>
      </div>
      <div :class ="{koth: variant==='kingofthehill', rk: variant==='racingkings'}">
        <div ref='board' class='cg-board-wrap' >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { Chessground } from 'chessgroundx'
import ChessPocket from './ChessPocket'

const WHITE = true
const BLACK = false

export default {
  name: 'ChessGround',
  components: {
    ChessPocket
  },
  data () {
    return {
      ranks: ['1', '2', '3', '4', '5', '6', '7', '8'],
      files: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
      selectedPiece: null,
      piecesToIdx: {
        P: 4,
        N: 3,
        B: 2,
        R: 1,
        Q: 0,
        p: 0,
        n: 1,
        b: 2,
        r: 3,
        q: 4
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
    colors: {
      type: Array,
      default: () => (['w', 'b'])
    },
    piecesW: {
      type: Array,
      default: () => ([
        { count: 0, type: 'queen' },
        { count: 0, type: 'rook' },
        { count: 0, type: 'bishop' },
        { count: 0, type: 'knight' },
        { count: 0, type: 'pawn' }
      ])
    },
    piecesB: {
      type: Array,
      default: () => ([
        { count: 0, type: 'pawn' },
        { count: 0, type: 'knight' },
        { count: 0, type: 'bishop' },
        { count: 0, type: 'rook' },
        { count: 0, type: 'queen' }
      ])
    }
  },
  computed: {
    turn () {
      return this.$store.getters.turn ? 'white' : 'black'
    },
    legalMoves () {
      return this.$store.getters.legalMoves.split(' ')
    },
    ...mapGetters(['initialized', 'variant', 'multipv', 'bestmove', 'redraw', 'pieceStyle', 'fen', 'lastFen', 'orientation', 'check'])
  },
  watch: {
    initialized () {
      this.updateBoard()
    },
    fen () {
      this.updateBoard()
    },
    orientation () {
      this.updateBoard()
    },
    pieceStyle (pieceStyle) {
      this.updatePieceCSS(pieceStyle)
    },
    bestmove () {
      const shapes = []
      const multipv = this.multipv

      if (this.$store.getters.started) {
        let lineWidth = 10
        for (let idx = 0; idx < multipv.length; ++idx) {
          if ('ucimove' in multipv[idx]) {
            const move = multipv[idx].ucimove
            const orig = move.substring(0, 2)
            const dest = move.substring(2, 4)
            let drawShape

            if (move.indexOf('@') !== -1) {
              const pieceType = move[0].toLowerCase()
              const pieceConv = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' }
              shapes.unshift({
                orig: dest,
                dest: dest,
                brush: 'blue',
                modifiers: { lineWidth: lineWidth },
                piece: { role: pieceConv[pieceType], color: this.turn }
              })
              drawShape = { orig: dest, brush: 'blue', modifiers: { lineWidth: lineWidth } }
            } else {
              drawShape = { orig: orig, dest: dest, brush: 'blue', modifiers: { lineWidth: lineWidth } }
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
    variant () {
      this.board.set({
        variant: this.variant,
        lastMove: false
      })
      this.updateBoard()
    }
  },
  methods: {
    updatePieceCSS (pieceStyle) {
      const file = document.createElement('link')
      file.rel = 'stylesheet'
      file.href = 'src/renderer/assets/images/piece-css/' + pieceStyle + '.css'
      document.head.appendChild(file)
    },
    dropPiece (event, pieceType, color) {
      this.board.dragNewPiece({ role: pieceType, color: color, promoted: false }, event)
      this.selectedPiece = pieceType
      console.log(`dropPiece: ${event} ${pieceType} ${color}`)
      console.log(`dropPiece: ${this.board.getFen()}`)
    },
    possibleMoves () {
      const dests = {}

      let fromSq
      let toSq
      for (let i = 0; i < this.legalMoves.length; i++) {
        // don't include dropping moves
        if (this.legalMoves[i].length !== 3) {
          fromSq = this.legalMoves[i].substring(0, 2)
          toSq = this.legalMoves[i].substring(2, 4)
        }
        if (fromSq in dests) {
          dests[fromSq].push(toSq)
        } else {
          dests[fromSq] = [toSq]
        }
      }
      return dests
    },
    isPromotion (orig, dest) {
      const filteredPromotions = this.promotions.filter(move => move.from === orig && move.to === dest)
      return filteredPromotions.length > 0 // The current movement is a promotion
    },
    resetPockets (pieces) {
      for (let idx = 0; idx < pieces.length; idx++) {
        pieces[idx].count = 0
      }
    },
    afterDrag () {
      return (role, key) => {
        const pieces = { pawn: 'P', knight: 'N', bishop: 'B', rook: 'R', queen: 'Q' }
        const move = pieces[role] + '@' + key
        this.$store.dispatch('push', move)
        this.updateHand()
      }
    },
    changeTurn () {
      return (orig, dest) => {
        if (this.isPromotion(orig, dest)) {
          this.promoteTo = this.onPromotion()
        }
        const uciMove = orig + dest
        this.lastMoveSan = this.$store.getters.sanMove(uciMove)
        let isCheck = false
        if(this.lastMoveSan.includes('+')){ //the last move was check iff the san notation of the last move contained a '+'
          isCheck = true
        }
        this.$store.dispatch('check', isCheck)
        this.$store.dispatch('push', uciMove)
        console.log('colorAfterPush:' + this.turn)
        this.updateHand()
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
        pocket[pieceIdx].count += 1
      }
    },
    updateHand () {
      // Crazyhouse pocket pieces
      this.resetPockets(this.piecesW)
      this.resetPockets(this.piecesB)
      this.updatePocket(this.piecesW, this.$store.getters.pocket(WHITE), WHITE)
      this.updatePocket(this.piecesB, this.$store.getters.pocket(BLACK), BLACK) 
    },
    afterMove () {
      const events = {}
      events.fen = this.fen

      events.history = [this.lastMoveSan]
      this.$emit('onMove', events)
      this.$store.dispatch('lastFen', this.fen)
      
    },
    updateBoard () {
      this.board.set({
          check: this.check,
          fen: this.fen,
          turnColor: this.turn,
          highlight: this.fen==this.lastFen ? {
            lastMove: true,
            check: true
          } : {
            lastMove: false,
            check: true
          },
          movable:  this.fen==this.lastFen ? { //moving is only possible at the end of the line
            dests: this.possibleMoves(),
            color: this.turn
          } : {
            dests: {},
            color: this.turn
          },
          orientation: this.orientation
        })
        if(this.variant === 'crazyhouse') {
          this.updateHand()
        }
    }
  },
  mounted () {
    this.board = Chessground(this.$refs.board, {
      coordinates: false,
      fen: this.fen,
      turnColor: 'white',
      highlight: {
        lastMove: true, // add last-move class to squares
        check: true // add check class to squares
      },
      drawable: {
        enabled: true, // can draw
        visible: true, // can view
        eraseOnClick: false
      },
      movable: {
        events: { after: this.changeTurn() , afterNewPiece: this.afterDrag()},
        color: 'white',
        free: false
      },
      orientation: this.orientation
    })
  }
}
</script>

<style>
@import '../assets/chessground.css';
@import '../assets/theme.css';

.black {
  transform: scaleY(-1);
}
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
  position: sticky;
  display: table;
}
.koth cg-container::before {
  width: 25%;
  height: 25%;
  box-shadow: 0 0 10px rgba(0,0,0,0.7);
  background: rgba(230,230,230,0.2);
  content: '';
  position: absolute;
  top: 37.5%;
  left: 37.5%;
  z-index: 1;
  pointer-events: none;
  border-radius: 0px 0px 0px 0px;
}

.rk cg-container::before{
    background: rgba(230,230,230,0.2);
    width: 100%;
    height: 12.5%;
    box-shadow: 0 0 10px rgba(0,0,0,0.7);
    content: '';
    position: absolute;
    left: 0;
    z-index: 1;
    pointer-events: none;
    border-radius: 4px 4px 0px 0px;
}
</style>
