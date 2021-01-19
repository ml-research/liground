<template>
  <div class="blue merida is2d">
    <div class="grid-parent">
      <div
        v-if="variant==='crazyhouse'|| variant==='shogi' "
        ref="pockets"
        class="pockets"
        :class="{ mirror : $store.getters.orientation == &quot;black&quot;, shogi: variant == &quot;shogi&quot;}"
      >
        <ChessPocket
          id="chesspocket_top"
          color="black"
          :pieces="piecesB"
          @selection="dropPiece"
        />
        <ChessPocket
          id="chesspocket_bottom"
          color="white"
          :pieces="piecesW"
          @selection="dropPiece"
        />
      </div>
      <div :class="{koth: variant==='kingofthehill', rk: variant==='racingkings', dim8x8: dimensionNumber===0, dim9x10: dimensionNumber === 3 , dim9x9: dimensionNumber === 1}">
        <div class="cg-board-wrap">
          <div ref="board" />
          <div
            v-if="isPromotionModalVisible && !isPast"
            id="PromotionModal"
            ref="promotion"
            :style="promotionPosition"
          >
            <PromotionModal
              @close="closePromotionModal"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { Chessground } from 'chessgroundx'
import * as cgUtil from 'chessgroundx/util'
import ChessPocket from './ChessPocket'
import PromotionModal from './PromotionModal.vue'

const WHITE = true
const BLACK = false

export default {
  name: 'ChessGround',
  components: {
    ChessPocket, PromotionModal
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
    }
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
      shogiPiecesToIdx: {
        P: 6,
        L: 5,
        N: 4,
        S: 3,
        G: 2,
        B: 1,
        R: 0,
        p: 0,
        l: 1,
        n: 2,
        s: 3,
        g: 4,
        b: 5,
        r: 6
      },
      piecesW: [
        { count: 0, type: 'queen' },
        { count: 0, type: 'rook' },
        { count: 0, type: 'bishop' },
        { count: 0, type: 'knight' },
        { count: 0, type: 'pawn' }
      ],
      piecesB: [
        { count: 0, type: 'pawn' },
        { count: 0, type: 'knight' },
        { count: 0, type: 'bishop' },
        { count: 0, type: 'rook' },
        { count: 0, type: 'queen' }
      ],
      chessPiecesW: [
        { count: 0, type: 'queen' },
        { count: 0, type: 'rook' },
        { count: 0, type: 'bishop' },
        { count: 0, type: 'knight' },
        { count: 0, type: 'pawn' }
      ],
      chessPiecesB: [
        { count: 0, type: 'pawn' },
        { count: 0, type: 'knight' },
        { count: 0, type: 'bishop' },
        { count: 0, type: 'rook' },
        { count: 0, type: 'queen' }
      ],
      shogiPiecesB: [
        { count: 0, type: 'pawn' },
        { count: 0, type: 'lance' },
        { count: 0, type: 'knight' },
        { count: 0, type: 'silver' },
        { count: 0, type: 'gold' },
        { count: 0, type: 'bishop' },
        { count: 0, type: 'rook' }
      ],
      shogiPiecesW: [
        { count: 0, type: 'rook' },
        { count: 0, type: 'bishop' },
        { count: 0, type: 'gold' },
        { count: 0, type: 'silver' },
        { count: 0, type: 'knight' },
        { count: 0, type: 'lance' },
        { count: 0, type: 'pawn' }
      ],
      board: null,
      shapes: [],
      pieceShapes: [],
      promotions: [],
      promoteTo: 'q',
      isPromotionModalVisible: false,
      uciMove: undefined
    }
  },
  computed: {
    currentMove () { // returns undefined when the current fen doesnt match a move from the history, otherwise it returns move from the moves array that matches the current fen
      for (let num = 0; num < this.moves.length; num++) {
        if (this.moves[num].fen === this.fen) {
          return this.moves[num]
        }
      }
      return undefined
    },
    turn () {
      return this.$store.getters.turn ? 'white' : 'black'
    },
    legalMoves () {
      return this.$store.getters.legalMoves.split(' ')
    },
    promotionPosition () {
      if (this.uciMove) {
        const dest = this.uciMove.substring(2, 4)

        let left = (8 - cgUtil.key2pos(dest)[0]) * 12.5

        if (this.orientation === 'white') {
          left = 87.5 - left
        }

        const vertical = this.turn === this.orientation ? 0 : (7 - 3) * 12.5
        return { left: `${left}%`, top: `${vertical}%` }
      } else {
        return undefined
      }
    },
    ...mapGetters(['initialized', 'variant', 'multipv', 'hoveredpv', 'bestmove', 'redraw', 'pieceStyle', 'boardStyle', 'fen', 'lastFen', 'orientation', 'moves', 'isPast', 'dimensionNumber'])
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
      document.dispatchEvent(new Event('renderPromotion'))
    },
    pieceStyle (pieceStyle) {
      this.updatePieceCSS(pieceStyle)
      document.dispatchEvent(new Event('renderPromotion'))
    },
    boardStyle (boardStyle) {
      this.updateBoardCSS(boardStyle)
    },
    bestmove () {
      const multipv = this.multipv
      const shapes = []
      const pieceShapes = []

      if (this.$store.getters.started) {
        let lineWidth = 10
        for (let idx = 0; idx < multipv.length; ++idx) {
          if ('ucimove' in multipv[idx] && multipv[idx].ucimove.length > 0) {
            const move = multipv[idx].ucimove
            const orig = move.substring(0, 2)
            const dest = move.substring(2, 4)
            let drawShape

            if (move.indexOf('@') !== -1) {
              const pieceType = move[0].toLowerCase()
              const pieceConv = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' }
              pieceShapes.unshift({
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

            // adjust color if pv line is hovered
            if (idx === this.hoveredpv) {
              drawShape.brush = 'yellow'
            }

            // put item in front of list, so that the bestmove is drawn last
            shapes.unshift(drawShape)

            lineWidth -= 2
          }
        }
      }
      this.pieceShapes = pieceShapes
      this.shapes = shapes
      this.drawShapes()
    },
    hoveredpv () {
      const index = this.shapes.length - this.hoveredpv - 1
      for (const [i, shape] of this.shapes.entries()) {
        shape.brush = i === index ? 'yellow' : 'blue'
      }
      this.drawShapes()
    },
    variant () {
      if (this.variant === 'shogi') {
        this.piecesW = this.shogiPiecesW
        this.piecesB = this.shogiPiecesB
      }
      if (this.variant === 'crazyhouse') {
        this.piecesW = this.chessPiecesW
        this.piecesB = this.chessPiecesB
      }
      this.resetPockets(this.piecesW)
      this.resetPockets(this.piecesB)
      if (this.board.state.geometry !== this.dimensionNumber) {
        this.board = Chessground(this.$refs.board, {
          coordinates: false,
          fen: this.fen,
          turnColor: 'white',
          resizable: true,
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
            events: { after: this.changeTurn(), afterNewPiece: this.afterDrag() },
            color: 'white',
            free: false
          },
          orientation: this.orientation,
          geometry: this.$store.getters.dimensionNumber
        })

        document.body.dispatchEvent(new Event('chessground.resize'))
      }
      if (this.variant === 'crazyhouse' || this.variant === 'shogi') {
        document.body.dispatchEvent(new Event('chessground.resize'))
      }
      this.board.set({
        variant: this.variant,
        lastMove: false
      })

      this.updateBoard()
      this.isPromotionModalVisible = false
    }
  },
  mounted () {
    this.board = Chessground(this.$refs.board, {
      coordinates: false,
      fen: this.fen,
      turnColor: 'white',
      resizable: true,
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
        events: { after: this.changeTurn(), afterNewPiece: this.afterDrag() },
        color: 'white',
        free: false,
        rookCastle: true
      },
      premovable: {
        enabled: false
      },
      orientation: this.orientation
    })
  },
  methods: {
    showPromotionModal () {
      this.isPromotionModalVisible = true
      document.dispatchEvent(new Event('renderPromotion'))
    },
    closePromotionModal (value) {
      this.isPromotionModalVisible = false
      this.promoteTo = value
      this.uciMove = this.uciMove + String(this.promoteTo)
      this.lastMoveSan = this.$store.getters.sanMove(this.uciMove)
      this.$store.dispatch('push', this.uciMove)
      this.updateHand()
      this.afterMove()
    },
    updatePieceCSS (pieceStyle) {
      const file = document.createElement('link')
      file.rel = 'stylesheet'
      if (this.$store.getters.isInternational) {
        file.href = 'src/renderer/assets/images/piece-css/international/' + pieceStyle + '.css'
      }
      if (this.$store.getters.isSEA) {
        file.href = 'src/renderer/assets/images/piece-css/sea/' + pieceStyle + '.css'
      }
      if (this.$store.getters.isXiangqi) {
        file.href = 'src/renderer/assets/images/piece-css/xiangqi/' + pieceStyle + '.css'
      }
      if (this.$store.getters.isShogi) {
        file.href = 'src/renderer/assets/images/piece-css/shogi/' + pieceStyle + '.css'
      }
      document.head.appendChild(file)
    },
    updateBoardCSS (boardStyle) {
      const file = document.createElement('link')
      file.rel = 'stylesheet'
      if (this.$store.getters.isInternational) {
        file.href = 'src/renderer/assets/images/board-css/international/' + boardStyle + '.css'
      } else
      if (this.$store.getters.isXiangqi) {
        file.href = 'src/renderer/assets/images/board-css/xiangqi/' + this.variant + '/' + boardStyle + '.css'
      } else
      if (this.$store.getters.isSEA) {
        file.href = 'src/renderer/assets/images/board-css/sea/' + boardStyle + '.css'
      } else
      if (this.$store.getters.isShogi) {
        file.href = 'src/renderer/assets/images/board-css/shogi/' + boardStyle + '.css'
      }
      document.head.appendChild(file)
    },
    dropPiece (event, pieceType, color) {
      this.board.dragNewPiece({ role: pieceType, color: color, promoted: false }, event)
      this.selectedPiece = pieceType
      console.log(`dropPiece: ${event} ${pieceType} ${color}`)
      console.log(`dropPiece: ${this.board.getFen()}`)
    },
    increaseNumbers (move) {
      const letters = move.split(/(\d+)/)
      letters[1] = String(parseInt(letters[1]) + 1)
      letters[3] = String(parseInt(letters[3]) + 1)
      const ret = letters.join('')
      return ret
    },
    lowerNumbers (move) {
      const letters = move.split(/(\d+)/)
      letters[1] = String(parseInt(letters[1]) - 1)
      letters[3] = String(parseInt(letters[3]) - 1)
      const ret = letters.join('')
      return ret
    },
    possibleMoves () {
      const dests = {}

      let fromSq
      let toSq
      for (let i = 0; i < this.legalMoves.length; i++) {
        // don't include dropping moves
        if (this.legalMoves[i].length !== 3) {
          let Move = this.legalMoves[i]
          if (this.dimensionNumber === 3) {
            Move = this.lowerNumbers(Move)
          }
          fromSq = Move.substring(0, 2)
          toSq = Move.substring(2, 4)
        }
        if (fromSq in dests) {
          dests[fromSq].push(toSq)
        } else {
          dests[fromSq] = [toSq]
        }
      }
      return dests
    },
    isPromotion (uciMove) {
      try {
        this.lastMoveSan = this.$store.getters.sanMove(uciMove)
      } catch (err) {
        return true
      }
      return false
    },
    resetPockets (pieces) {
      for (let idx = 0; idx < pieces.length; idx++) {
        pieces[idx].count = 0
      }
    },
    afterDrag () {
      return (role, key) => {
        const pieces = { pawn: 'P', knight: 'N', bishop: 'B', rook: 'R', queen: 'Q', silver: 'S', gold: 'G', lance: 'L' }
        const move = pieces[role] + '@' + key
        if (this.$store.getters.legalMoves.includes(move)) {
          this.$store.dispatch('push', move)
          this.updateHand()
        } else {
          this.updateBoard()
        }
      }
    },
    changeTurn () {
      return (orig, dest) => {
        let uciMove = orig + dest
        if (this.dimensionNumber === 3) {
          uciMove = this.increaseNumbers(uciMove)
        }
        if (this.isPromotion(uciMove)) {
          this.uciMove = uciMove
          this.showPromotionModal()
        } else {
          this.lastMoveSan = this.$store.getters.sanMove(uciMove)
          this.$store.dispatch('push', uciMove)
          this.updateHand()
          this.afterMove()
        }
      }
    },
    updatePocket (pocket, pocketPieces, color) {
      for (let idx = 0; idx < pocketPieces.length; ++idx) {
        let pieceIdx
        if (this.variant === 'shogi') {
          if (color === WHITE) {
            pieceIdx = this.shogiPiecesToIdx[pocketPieces[idx].toUpperCase()]
          } else {
            pieceIdx = this.shogiPiecesToIdx[pocketPieces[idx]]
          }
        } else {
          if (color === WHITE) {
            pieceIdx = this.piecesToIdx[pocketPieces[idx].toUpperCase()]
          } else {
            pieceIdx = this.piecesToIdx[pocketPieces[idx]]
          }
        }
        pocket[pieceIdx].count += 1
      }
    },
    updateHand () {
      // Crazyhouse pocket pieces
      this.resetPockets(this.piecesW)
      this.resetPockets(this.piecesB)
      if (this.fen === this.lastFen) {
        this.updatePocket(this.piecesW, this.$store.getters.pocket(WHITE), WHITE)
        this.updatePocket(this.piecesB, this.$store.getters.pocket(BLACK), BLACK)
      } else {
        let i = 0
        for (let num = 0; num < this.moves.length; num++) { // i will have the index of the currently displayed move
          if (this.moves[num].fen === this.fen) {
            i = num
            break
          }
        }
        this.updatePocket(this.piecesW, this.moves[i].whitePocket, WHITE) // load the pocketpieces from the currently displayed move
        this.updatePocket(this.piecesB, this.moves[i].blackPocket, BLACK)
      }
    },
    afterMove () {
      const events = {}
      events.fen = this.fen
      events.history = [this.lastMoveSan]
      this.$emit('onMove', events)
      this.$store.dispatch('lastFen', this.fen)
    },
    updateBoard () {
      // logic to find out if a check should be displayed:
      let isCheck = false // ensures that no check is displayed when the current move was not a check
      if (this.currentMove !== undefined && (this.currentMove.name.includes('+') || this.currentMove.name.includes('#'))) { // the last move was check iff the san notation of the last move contained a '+'
        this.moves[this.moves.length - 1].check = this.turn // the check property of the board accepts a color or a boolean
        isCheck = this.currentMove.check
      }
      // logic to find out which move was last and should thus be highlighted:
      if (this.currentMove === undefined || this.moves.length === 0) {
        this.board.state.lastMove = undefined
      } else {
        let string = String(this.currentMove.uci)
        if (this.dimensionNumber === 3) {
          string = this.lowerNumbers(string)
        }
        const first = string.substring(0, 2)
        const second = string.substring(2, 4)
        if (string.includes('@')) { // no longer displays a green box in the corner
          this.board.state.lastMove = [second]
        } else {
          this.board.state.lastMove = [first, second]
        }
      }
      this.board.set({
        check: isCheck,
        fen: this.fen,
        turnColor: this.turn,
        highlight: {
          lastMove: true,
          check: true
        },
        movable: this.fen === this.lastFen
          ? { // moving is only possible at the end of the line
              dests: this.possibleMoves(),
              color: this.turn
            }
          : {
              dests: {},
              color: this.turn
            },
        orientation: this.orientation
      })

      if (this.variant === 'crazyhouse' || this.variant === 'shogi') {
        this.updateHand()
      }
    },
    drawShapes () {
      if (this.board !== null) {
        this.board.setShapes([...this.shapes, ...this.pieceShapes])
      }
    }
  }
}
</script>

<style>
@import '../assets/chessground.css';
@import '../assets/theme.css';
@import '../assets/dim9x9.css';
@import '../assets/dim8x8.css';
@import '../assets/dim9x10.css';

#PromotionModal {
  position: absolute;
  z-index: 4;
  width: 12.5%;
  height: 50%;
}
.mirror {
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
  height: 100%;
}
.pockets.shogi{
  display:grid;
  grid-template-columns: 1fr 1fr ;

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
  background-image: url('/src/renderer/assets/images/board/svg/blue.svg');
  position: relative;
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
.rk cg-board::before{
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
/*
  CSS for 9x10 board e.g. xiangqi/janggi etc.
*/

</style>
