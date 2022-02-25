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
      <div
        id="chessboard"
        :class="{ koth: variant==='kingofthehill', rk: variant==='racingkings', dim8x8: dimensionNumber===0, dim9x10: dimensionNumber === 3 , dim9x9: dimensionNumber === 1 }"
        @mousewheel.ctrl.prevent="resize($event)"
      >
        <div
          class="cg-board-wrap"
          @mousedown="closeCursorHand"
          @mouseup="openCursorHand"
        >
          <div
            class="resizer"
            @mouseover="shade"
            @mousedown="startDragging"
            @mouseout="hideShade"
          />
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
      boardWidth: 0,
      boardHeight: 0,
      startingPoint: 640,
      dragging: false,
      enlarged: 0,
      enlarged9x9width: 0,
      enlarged9x9height: 0,
      enlarged9x10width: 0,
      enlarged9x10height: 0,
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
        { count: 0, type: 'q-piece' },
        { count: 0, type: 'r-piece' },
        { count: 0, type: 'b-piece' },
        { count: 0, type: 'n-piece' },
        { count: 0, type: 'p-piece' }
      ],
      piecesB: [
        { count: 0, type: 'p-piece' },
        { count: 0, type: 'n-piece' },
        { count: 0, type: 'b-piece' },
        { count: 0, type: 'r-piece' },
        { count: 0, type: 'q-piece' }
      ],
      chessPiecesW: [
        { count: 0, type: 'q-piece' },
        { count: 0, type: 'r-piece' },
        { count: 0, type: 'b-piece' },
        { count: 0, type: 'n-piece' },
        { count: 0, type: 'p-piece' }
      ],
      chessPiecesB: [
        { count: 0, type: 'p-piece' },
        { count: 0, type: 'n-piece' },
        { count: 0, type: 'b-piece' },
        { count: 0, type: 'r-piece' },
        { count: 0, type: 'q-piece' }
      ],
      shogiPiecesB: [
        { count: 0, type: 'p-piece' },
        { count: 0, type: 'l-piece' },
        { count: 0, type: 'n-piece' },
        { count: 0, type: 's-piece' },
        { count: 0, type: 'g-piece' },
        { count: 0, type: 'b-piece' },
        { count: 0, type: 'r-piece' }
      ],
      shogiPiecesW: [
        { count: 0, type: 'r-piece' },
        { count: 0, type: 'b-piece' },
        { count: 0, type: 'g-piece' },
        { count: 0, type: 's-piece' },
        { count: 0, type: 'n-piece' },
        { count: 0, type: 'l-piece' },
        { count: 0, type: 'p-piece' }
      ],
      board: null,
      shapes: [],
      pieceShapes: [],
      promotions: [],
      isPromotionModalVisible: false,
      promotionMove: undefined,
      pieceStyleEl: null,
      boardStyleEl: null,
      start: true
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
    ...mapGetters(['initialized', 'variant', 'multipv', 'hoveredpv', 'redraw', 'pieceStyle', 'boardStyle', 'fen', 'lastFen', 'orientation', 'moves', 'isPast', 'dimensionNumber', 'analysisMode', 'active', 'PvE', 'enginetime', 'resized', 'resized9x9width', 'resized9x9height', 'resized9x10width', 'resized9x10height', 'dimNumber'])
  },
  watch: {
    dimensionNumber () {
      const boardSize = document.querySelector('.cg-wrap')
      switch (this.dimensionNumber) {
        case 0:
          boardSize.style.width = 600 + this.enlarged + 'px'
          boardSize.style.height = 600 + this.enlarged + 'px'
          this.startingPoint = this.enlarged
          document.body.dispatchEvent(new Event('chessground.resize'))
          break
        case 1:
          boardSize.style.width = 520 + this.enlarged9x9width + 'px'
          boardSize.style.height = 600 + this.enlarged9x9height + 'px'
          this.startingPoint = this.enlarged9x9height
          document.body.dispatchEvent(new Event('chessground.resize'))
          break
        case 3:
          boardSize.style.width = 540 + this.enlarged9x10width + 'px'
          boardSize.style.height = 600 + this.enlarged9x10height + 'px'
          this.startingPoint = this.enlarged9x10height
          document.body.dispatchEvent(new Event('chessground.resize'))
          break
      }
      this.boardWidth = boardSize.style.width
      this.boardHeight = boardSize.style.height
      this.$store.dispatch('setResized', this.enlarged)
      this.$store.dispatch('setResized9x9width', this.enlarged9x9width)
      this.$store.dispatch('setResized9x10width', this.enlarged9x10width)
      this.$store.dispatch('setResized9x9height', this.enlarged9x9height)
      this.$store.dispatch('setResized9x10height', this.enlarged9x10height)
      this.$store.dispatch('setDimNumber', this.dimensionNumber)
    },
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
          const move = pvline.ucimove
          let orig = move.substring(0, 2)
          let dest = move.substring(2, 4)
          let drawShape
          if (this.dimensionNumber === 3) {
            const extract = this.extractMoves(move)
            orig = extract[0].replace('10', ':')
            dest = extract[1].replace('10', ':')
          }
          if (move.includes('@')) {
            const pieceType = move[0].toLowerCase()
            const pieceConv = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' }
            pieceShapes.unshift({
              orig: dest,
              dest: dest,
              brush: 'paleBlue',
              modifiers: { lineWidth },
              piece: {
                role: pieceConv[pieceType],
                color: this.turn
              }
            })
            drawShape = { orig: dest, brush: 'paleBlue', modifiers: { lineWidth } }
          } else {
            drawShape = { orig, dest, brush: 'paleBlue', modifiers: { lineWidth } }
          }
          // adjust color if pv line is hovered
          if (i === this.hoveredpv) {
            drawShape.brush = 'blue'
          }
          if (i === 0) {
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
        shape.brush = i === index ? 'blue' : 'paleBlue'
        if (i === this.shapes.length - 1) {
          this.shapes[this.shapes.length - 1].brush = 'yellow'
        }
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
    if (!isNaN(Number(localStorage.resized))) {
      this.enlarged = Number(localStorage.resized)
    }
    if (!isNaN(Number(localStorage.resized9x9width))) {
      this.enlarged9x9width = Number(localStorage.resized9x9width)
      this.enlarged9x9height = Number(localStorage.resized9x9height)
    }
    if (!isNaN(Number(localStorage.resized9x10width))) {
      this.enlarged9x10width = Number(localStorage.resized9x10width)
      this.enlarged9x10height = Number(localStorage.resized9x10height)
    }
    window.addEventListener('mouseup', this.stopDragging)
    window.addEventListener('mousemove', this.doResize)
    window.addEventListener('wheel', this.reRender)
    window.addEventListener('mouseup', this.reRender)

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
    // force initial resize
    document.body.dispatchEvent(new Event('chessground.resize'))
    const boardSize = document.querySelector('.cg-wrap')
    if (Number(localStorage.dimNumber) === 0) {
      boardSize.style.width = 600 + this.enlarged + 'px'
      boardSize.style.height = 600 + this.enlarged + 'px'
      this.startingPoint = this.enlarged
    }
    document.body.dispatchEvent(new Event('chessground.resize'))
  },
  methods: {
    closeCursorHand () {
      const board = document.querySelector('.cg-wrap')
      board.style.cursor = 'grabbing'
    },
    openCursorHand () {
      const board = document.querySelector('.cg-wrap')
      board.style.cursor = 'grab'
    },
    reRender (event) {
      document.body.dispatchEvent(new Event('chessground.resize'))
    },
    hideShade () {
      if (this.dragging === false) {
        document.querySelector('.resizer').style.opacity = 0.0
      }
    },
    shade () {
      document.querySelector('.resizer').style.opacity = 0.8
    },
    stopDragging () {
      document.querySelector('.resizer').style.opacity = 0.0
      this.dragging = false
    },
    startDragging () {
      this.dragging = true
      document.querySelector('.resizer').style.opacity = 0.8
    },
    doResize (event) {
      const boardSize = document.querySelector('.cg-wrap')
      if (this.dragging === false) {
        return
      }
      if (event.clientY - this.startingPoint > 40) {
        switch (this.dimensionNumber) {
          case 0:
            if (this.enlarged < 200) {
              this.enlarged += 40
            }
            break
          case 1:
            if (this.enlarged9x9width < 200) {
              this.enlarged9x9width += 35
              this.enlarged9x9height += (35 * 1.153846153846154) // to get the aspect ration of 1.153 width to height
            }
            break
          case 3:
            if (this.enlarged9x10width < 200) {
              this.enlarged9x10width += 35
              this.enlarged9x10height += (35 * 1.111111111111111)
            }
            break
        }
        this.startingPoint = event.clientY
      } else if (event.clientY - this.startingPoint < -40) {
        switch (this.dimensionNumber) {
          case 0:
            if (this.enlarged > -200) {
              this.enlarged -= 40
            }
            break
          case 1:
            if (this.enlarged9x9width > -200) {
              this.enlarged9x9width -= 35
              this.enlarged9x9height -= (35 * 1.153846153846154)
            }
            break
          case 3:
            if (this.enlarged9x10width > -200) {
              this.enlarged9x10width -= 35
              this.enlarged9x10height -= (35 * 1.111111111111111)
            }
            break
        }
        this.startingPoint = event.clientY
      }
      if (this.dimensionNumber === 0 && (this.enlarged <= 200 && this.enlarged >= -200)) {
        boardSize.style.width = 600 + this.enlarged + 'px'
        boardSize.style.height = 600 + this.enlarged + 'px'
        document.body.dispatchEvent(new Event('chessground.resize'))
      } else if (this.dimensionNumber === 1 && (this.enlarged9x9width <= 200 && this.enlarged9x9width >= -200)) {
        boardSize.style.width = 520 + this.enlarged9x9width + 'px'
        boardSize.style.height = 600 + this.enlarged9x9height + 'px'
        document.body.dispatchEvent(new Event('chessground.resize'))
      } else if (this.dimensionNumber === 3 && (this.enlarged9x10width <= 200 && this.enlarged9x10width >= -200)) {
        boardSize.style.width = 540 + this.enlarged9x10width + 'px'
        boardSize.style.height = 600 + this.enlarged9x10height + 'px'
        document.body.dispatchEvent(new Event('chessground.resize'))
      }

      this.boardWidth = boardSize.style.width
      this.boardHeight = boardSize.style.height
      this.$store.dispatch('setResized', this.enlarged)
      this.$store.dispatch('setResized9x9height', this.enlarged9x9height)
      this.$store.dispatch('setResized9x10height', this.enlarged9x10height)
      this.$store.dispatch('setResized9x9width', this.enlarged9x9width)
      this.$store.dispatch('setResized9x10width', this.enlarged9x10width)
    },
    resize (event) {
      const boardSize = document.querySelector('.cg-wrap')
      if (event.deltaY > 0) {
        switch (this.dimensionNumber) {
          case 0:
            if (this.enlarged < 200) {
              this.enlarged += 40
              this.startingPoint += 40
            }
            break
          case 1:
            if (this.enlarged9x9width < 200) {
              this.enlarged9x9width += 35
              this.enlarged9x9height += (35 * 1.153846153846154)
              this.startingPoint += (35 * 1.153846153846154)
            }
            break
          case 3:
            if (this.enlarged9x10width < 200) {
              this.enlarged9x10width += 35
              this.enlarged9x10height += (35 * 1.111111111111111) // to get the aspect ration of 1.11111 width to height
              this.startingPoint += (35 * 1.111111111111111)
            }
            break
        }
      } else if (event.deltaY < 0) {
        switch (this.dimensionNumber) {
          case 0:
            if (this.enlarged > -200) {
              this.enlarged -= 40
              this.startingPoint -= 40
            }
            break
          case 1:
            if (this.enlarged9x9width > -200) {
              this.enlarged9x9width -= 35
              this.enlarged9x9height -= (35 * 1.153846153846154)
              this.startingPoint -= (35 * 1.153846153846154)
            }
            break
          case 3:
            if (this.enlarged9x10width > -200) {
              this.enlarged9x10width -= 35
              this.enlarged9x10height -= (35 * 1.111111111111111)
              this.startingPoint -= (35 * 1.111111111111111)
            }
            break
        }
      }

      if (this.dimensionNumber === 0 && (this.enlarged <= 200 && this.enlarged >= -200)) {
        boardSize.style.width = 600 + this.enlarged + 'px'
        boardSize.style.height = 600 + this.enlarged + 'px'
        document.body.dispatchEvent(new Event('chessground.resize'))
      } else if (this.dimensionNumber === 1 && (this.enlarged9x9width <= 200 && this.enlarged9x9width >= -200)) {
        boardSize.style.width = 520 + this.enlarged9x9width + 'px'
        boardSize.style.height = 600 + this.enlarged9x9height + 'px'
        document.body.dispatchEvent(new Event('chessground.resize'))
      } else if (this.dimensionNumber === 3 && (this.enlarged9x10width <= 200 && this.enlarged9x10width >= -200)) {
        boardSize.style.width = 540 + this.enlarged9x10width + 'px'
        boardSize.style.height = 600 + this.enlarged9x10height + 'px'
        document.body.dispatchEvent(new Event('chessground.resize'))
      }
      this.boardWidth = boardSize.style.width
      this.boardHeight = boardSize.style.height
      this.$store.dispatch('setResized', this.enlarged)
      this.$store.dispatch('setResized9x9height', this.enlarged9x9height)
      this.$store.dispatch('setResized9x10height', this.enlarged9x10height)
      this.$store.dispatch('setResized9x9width', this.enlarged9x9width)
      this.$store.dispatch('setResized9x10width', this.enlarged9x10width)
    },
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
        node.href = '../../../../static/piece-css/international/' + pieceStyle + '.css'
      } else if (this.$store.getters.isSEA) {
        node.href = '../../../../static/piece-css/sea/' + pieceStyle + '.css'
      } else if (this.$store.getters.isXiangqi || this.$store.getters.isJanggi) {
        node.href = '../../../../static/piece-css/xiangqi/' + pieceStyle + '.css'
      } else if (this.$store.getters.isShogi) {
        node.href = '../../../../static/piece-css/shogi/' + pieceStyle + '.css'
      }
    },
    updateBoardCSS (boardStyle) {
      const node = this.boardStyleEl
      if (this.$store.getters.isInternational) {
        node.href = '../../../../static/board-css/international/' + boardStyle + '.css'
      } else if (this.$store.getters.isXiangqi || this.$store.getters.isJanggi) {
        node.href = '../../../../static/board-css/xiangqi/' + this.variant + '/' + boardStyle + '.css'
      } else if (this.$store.getters.isSEA) {
        node.href = '../../../../static/board-css/sea/' + boardStyle + '.css'
      } else if (this.$store.getters.isShogi) {
        node.href = '../../../../static/board-css/shogi/' + boardStyle + '.css'
      }
      document.body.dispatchEvent(new Event('chessground.resize'))
    },
    dropPiece (event, pieceType, color) {
      this.board.dragNewPiece({ role: pieceType, color: color, promoted: false }, event)
      this.selectedPiece = pieceType
      console.log(`dropPiece: ${event} ${pieceType} ${color}`)
      console.log(`dropPiece: ${this.board.getFen()}`)
    },
    extractMoves (move) {
      const letters = move.split(/(\d+)/)
      let first = ''
      let second = ''
      let firstcomplete = false
      for (const i in letters) {
        if (isNaN(parseInt(letters[i])) && first.length !== 0) {
          firstcomplete = true
        }
        if (firstcomplete === false) {
          first += letters[i]
        }
        if (firstcomplete) {
          second += letters[i]
        }
      }
      const ret = [first, second]
      return ret
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
          const Move = this.legalMoves[i]
          fromSq = Move.substring(0, 2)
          toSq = Move.substring(2, 4)
          if (this.dimensionNumber === 3) {
            const extract = this.extractMoves(Move)
            fromSq = extract[0].replace('10', ':')
            toSq = extract[1].replace('10', ':')
          }
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
            { type: 'k-piece' },
            { type: 'q-piece' },
            { type: 'r-piece' },
            { type: 'b-piece' },
            { type: 'n-piece' }
          ]
        } else {
          this.promotions = [
            { type: 'q-piece' },
            { type: 'r-piece' },
            { type: 'b-piece' },
            { type: 'n-piece' }
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
        if (type === 'p-piece') {
          this.promotions = [
            { type: 'p-piece' },
            { type: 'pp-piece' }
          ]
        } else if (type === 'l-piece') {
          this.promotions = [
            { type: 'l-piece' },
            { type: 'pl-piece' }
          ]
        } else if (type === 'n-piece') {
          this.promotions = [
            { type: 'n-piece' },
            { type: 'pn-piece' }
          ]
        } else if (type === 's-piece') {
          this.promotions = [
            { type: 's-piece' },
            { type: 'ps-piece' }
          ]
        } else if (type === 'b-piece') {
          this.promotions = [
            { type: 'b-piece' },
            { type: 'pb-piece' }
          ]
        } else if (type === 'r-piece') {
          this.promotions = [
            { type: 'r-piece' },
            { type: 'pr-piece' }
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
        const pieces = { 'p-piece': 'P', 'n-piece': 'N', 'b-piece': 'B', 'r-piece': 'R', 'q-piece': 'Q', 's-piece': 'S', 'g-piece': 'G', 'l-piece': 'L' }
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
          uciMove = uciMove.replaceAll(':', '10') // Convert the ':' back to '10'
        }
        if (this.isPromotion(uciMove)) {
          if (this.variant === 'makruk') {
            const move = uciMove + 'm'
            const prevMov = this.currentMove
            this.$store.dispatch('push', { move: move, prev: prevMov })
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
      // this.$emit('onMove', events)
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
        const string = String(this.currentMove.uci)
        let first = string.substring(0, 2)
        let second = string.substring(2, 4)
        if (this.dimensionNumber === 3) {
          const extract = this.extractMoves(string)
          first = extract[0].replace('10', ':')
          second = extract[1].replace('10', ':') // the 10th rank is represented as ":"
        }
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

.resizer{
  padding-left: 15px;
  padding-top: 15px;
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: red;
  z-index: 2;
  bottom: -1px;
  right: -1px;
  cursor: se-resize;
  opacity: 0.0;
  }
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
  color: var(--light-text-color);
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
