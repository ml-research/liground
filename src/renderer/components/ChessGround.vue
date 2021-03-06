<template>
  <div class="blue merida is2d">
    <div class="grid-parent">
      <div
        v-if="variant==='crazyhouse'|| variant==='shogi' "
        ref="pockets"
        class="pockets"
        :class="{ mirror : $store.getters.orientation === &quot;black&quot;, shogi: variant === &quot;shogi&quot; }"
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
      <div :class="{ koth: variant==='kingofthehill', rk: variant==='racingkings', dim8x8: dimensionNumber===0, dim9x10: dimensionNumber === 3 , dim9x9: dimensionNumber === 1 }">
        <div class="cg-board-wrap">
          <div ref="board" />
          <div
            v-if="isPromotionModalVisible"
            id="PromotionModal"
            ref="promotion"

            :style="promotionPosition"
          >
            <PromotionModal
              :prom-options="promotions"
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
      isPromotionModalVisible: false,
      promotionMove: undefined,
      pieceStyleEl: null,
      boardStyleEl: null
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
      if (this.promotionMove) {
        const dest = this.promotionMove.substring(2, 4)

        let left = (8 - cgUtil.key2pos(dest)[0]) * 12.5

        if (this.orientation === 'white') {
          left = 87.5 - left
        }

        const vertical = this.turn === this.orientation ? 0 : (8 - this.promotions.length) * 12.5
        return { left: `${left}%`, top: `${vertical}%` }
      } else {
        return undefined
      }
    },
    ...mapGetters(['initialized', 'variant', 'multipv', 'hoveredpv', 'redraw', 'pieceStyle', 'boardStyle', 'fen', 'lastFen', 'orientation', 'moves', 'isPast', 'dimensionNumber', 'analysisMode'])
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
    multipv () {
      const multipv = this.multipv
      const shapes = []
      const pieceShapes = []

      for (const [i, pvline] of multipv.entries()) {
        if (pvline && 'ucimove' in pvline && pvline.ucimove.length > 0) {
          const lineWidth = 2 + ((multipv.length - i) / multipv.length) * 8
          let move = pvline.ucimove
          let orig = move.substring(0, 2)
          let dest = move.substring(2, 4)
          let drawShape
          if (this.dimensionNumber === 3) {
            move = this.lowerNumbers(move)
            orig = move.substring(0, 2)
            dest = move.substring(2, 4)
          }

          if (move.includes('@')) {
            const pieceType = move[0].toLowerCase()
            const pieceConv = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' }
            pieceShapes.unshift({
              orig: dest,
              dest: dest,
              brush: 'blue',
              modifiers: { lineWidth },
              piece: {
                role: pieceConv[pieceType],
                color: this.turn
              }
            })
            drawShape = { orig: dest, brush: 'blue', modifiers: { lineWidth } }
          } else {
            drawShape = { orig, dest, brush: 'blue', modifiers: { lineWidth } }
          }

          // adjust color if pv line is hovered
          if (i === this.hoveredpv) {
            drawShape.brush = 'yellow'
          }

          // put item in front of list, so that the best move is drawn last
          shapes.unshift(drawShape)
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
      events: {
        select: () => this.removeFocusFromInputs(),
        move: () => this.removeFocusFromInputs()
      },
      orientation: this.orientation
    })

    // inject stylesheet placeholders into head
    this.boardStyleEl = document.createElement('link')
    this.boardStyleEl.rel = 'stylesheet'
    this.pieceStyleEl = document.createElement('link')
    this.pieceStyleEl.rel = 'stylesheet'
    document.head.appendChild(this.boardStyleEl)
    document.head.appendChild(this.pieceStyleEl)

    // set initial styles
    this.updateBoardCSS(this.boardStyle)
    this.updatePieceCSS(this.pieceStyle)
  },
  methods: {
    showPromotionModal () {
      this.isPromotionModalVisible = true
    },
    closePromotionModal (value) {
      this.isPromotionModalVisible = false
      this.promotionMove = this.promotionMove + value
      this.lastMoveSan = this.$store.getters.sanMove(this.promotionMove)
      const prevMov = this.currentMove
      this.$store.dispatch('push', { move: this.promotionMove, prev: prevMov })
      this.updateHand()
      this.afterMove()
    },
    updatePieceCSS (pieceStyle) {
      const node = this.pieceStyleEl
      if (this.$store.getters.isInternational) {
        node.href = 'static/piece-css/international/' + pieceStyle + '.css'
      } else if (this.$store.getters.isSEA) {
        node.href = 'static/piece-css/sea/' + pieceStyle + '.css'
      } else if (this.$store.getters.isXiangqi || this.$store.getters.isJanggi) {
        node.href = 'static/piece-css/xiangqi/' + pieceStyle + '.css'
      } else if (this.$store.getters.isShogi) {
        node.href = 'static/piece-css/shogi/' + pieceStyle + '.css'
      }
    },
    updateBoardCSS (boardStyle) {
      const node = this.boardStyleEl
      if (this.$store.getters.isInternational) {
        node.href = 'static/board-css/international/' + boardStyle + '.css'
      } else if (this.$store.getters.isXiangqi || this.$store.getters.isJanggi) {
        node.href = 'static/board-css/xiangqi/' + this.variant + '/' + boardStyle + '.css'
      } else if (this.$store.getters.isSEA) {
        node.href = 'static/board-css/sea/' + boardStyle + '.css'
      } else if (this.$store.getters.isShogi) {
        node.href = 'static/board-css/shogi/' + boardStyle + '.css'
      }
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
      const letters = move.split(/(\D)/)
      letters[2] = String(parseInt(letters[2]) - 1)
      letters[4] = String(parseInt(letters[4]) - 1)
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
      for (let i = 0; i < this.legalMoves.length; i++) {
        if (this.dimensionNumber === 3) {
          return false
        }
        if (this.legalMoves[i].length === 5) {
          if (this.legalMoves[i].includes(uciMove)) {
            return true
          }
        }
      }
      return false
    },
    setPromotionOptions (uciMove) {
      if (this.$store.getters.isInternational) {
        if (this.variant === 'antichess') {
          this.promotions = [
            { type: 'king' },
            { type: 'queen' },
            { type: 'rook' },
            { type: 'bishop' },
            { type: 'knight' }
          ]
        } else {
          this.promotions = [
            { type: 'queen' },
            { type: 'rook' },
            { type: 'bishop' },
            { type: 'knight' }
          ]
        }
      }
      if (this.variant === 'shogi') {
        const key = uciMove.substring(2, 4)
        const type = this.board.state.pieces[key].role
        let num = 0
        let promo = false
        for (let i = 0; i < this.legalMoves.length; i++) {
          if (this.legalMoves[i].includes(uciMove)) {
            num = num + 1
            if (this.legalMoves[i].includes('+')) {
              promo = true
            }
          }
        }
        if (type === 'pawn') {
          this.promotions = [
            { type: 'pawn' },
            { type: 'ppawn' }
          ]
        } else if (type === 'lance') {
          this.promotions = [
            { type: 'lance' },
            { type: 'plance' }
          ]
        } else if (type === 'knight') {
          this.promotions = [
            { type: 'knight' },
            { type: 'pknight' }
          ]
        } else if (type === 'silver') {
          this.promotions = [
            { type: 'silver' },
            { type: 'psilver' }
          ]
        } else if (type === 'bishop') {
          this.promotions = [
            { type: 'bishop' },
            { type: 'pbishop' }
          ]
        } else if (type === 'rook') {
          this.promotions = [
            { type: 'rook' },
            { type: 'prook' }
          ]
        }
        if (num === 1 && promo) {
          this.promotions = [this.promotions[1]]
        }
      }
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
        const prevMov = this.currentMove
        if (this.$store.getters.legalMoves.includes(move)) {
          this.$store.dispatch('push', { move: move, prev: prevMov })
          this.updateHand()
        } else {
          this.updateBoard()
        }
      }
    },
    changeTurn () {
      return (orig, dest, metadata) => {
        let uciMove = orig + dest
        if (this.dimensionNumber === 3) {
          uciMove = this.increaseNumbers(uciMove)
        }
        if (this.isPromotion(uciMove)) {
          if (this.variant === 'makruk') {
            const move = uciMove + 'm'
            this.$store.dispatch('push', move)
          } else {
            this.setPromotionOptions(uciMove)
            this.promotionMove = uciMove
            this.showPromotionModal()
          }
        } else {
          this.lastMoveSan = this.$store.getters.sanMove(uciMove)
          const prevMov = this.currentMove
          this.$store.dispatch('push', { move: uciMove, prev: prevMov })
          this.updateHand()
          this.afterMove()
          console.log(this.turn)
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
        movable: this.fen === this.lastFen || this.analysisMode
          ? { // moving is possible at the end of the line and in analysis mode
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
        this.board.setAutoShapes([...this.shapes, ...this.pieceShapes])
      }
    },
    removeFocusFromInputs () {
      if (document.activeElement.nodeName.toLowerCase() === 'input') {
        document.activeElement.blur()
      }
    }
  }
}
</script>

<style>
@import '../assets/chessground.css';
@import '../assets/dim9x9.css';
@import '../assets/dim8x8.css';
@import '../assets/dim9x10.css';

#PromotionModal {
  position: absolute;
  z-index: 4;
  width: 12.5%;
  height: 62.5%;
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
  background-color: var(--second-bg-color);
  border-radius: 5px;
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
