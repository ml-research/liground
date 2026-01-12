<template>
  <div
    class="pv-lines"
    ref="pvLines"
  >
    <div class="scroller">
      <VueContext
        ref="menu1"
        v-slot="{ data }"
      >
        <li>
          <a
            href="#"
            @click.prevent="asMain($event.target, data)"
          >Play as main line</a>
        </li>
        <li>
          <a
            href="#"
            @click.prevent="asAlt($event.target, data)"
          >Play line as alternative</a>
        </li>
      </VueContext>
      <VueContext
        ref="menu2"
        v-slot="{ data }"
      >
        <li>
          <a
            href="#"
            @click.prevent="asMain($event.target, data)"
          >Play entire line</a>
        </li>
      </VueContext>
      <template
        v-for="(line, id) in lines"
      >
        <div
          v-if="line"
          :key="`line-${id}`"
          class="item clickable"
          @mouseenter="onMouseEnter(id)"
          @mouseleave="onMouseLeave"
          @click="onClick(line)"
        >
          <span class="left">{{ line.cpDisplay }}</span>
          <span
            class="right"
            @contextmenu.prevent="(currentMove && currentMove.main) || (!currentMove && mainFirstMove) ? $refs.menu1.open($event, { line: line }) : $refs.menu2.open($event, { line: line })"
          >
            <span
              v-for="(entry, idx) in line.pv.split(' ')"
              :key="idx"
              class="pv-entry"
              :class="{ 'is-move-token': isMoveToken(entry) }"
              @mouseenter="isMoveToken(entry) && setPreview(id, idx, line.pv.split(' '), $event)"
              @click="isMoveToken(entry) && setBoard(id, idx, line.pv.split(' '))"
            >
              {{ entry }}
            </span>
          </span>
          </div>

        <div
          v-if="!line"
          :key="`placeholder-${id}`"
          class="item placeholder"
        >
          ...
        </div>
      </template>
    </div>
    <div
      v-if="previewLineId !== null && previewFen"
      class="pv-preview"
      :class="[boardStyle, pieceStyle, 'is2d', { koth: variant==='kingofthehill', rk: variant==='racingkings', dim8x8: dimensionNumber===0, dim9x10: dimensionNumber===3, dim9x9: dimensionNumber===1 }]"
      :style="{ top: `${previewTop}px`, left: `${previewLeft}px` }"
    >
      <div class="cg-board-wrap">
        <div ref="previewBoard"></div>
      </div>
    </div>
    <footer class="footer">
      <div
        v-if="engineDetails.length > 0"
        class="details"
      >
        {{ engineDetails }}
      </div>
      <div
        class="collapsible"
        @click="toggle"
      >
        <em
          v-show="showExpandIcon"
          class="icon mdi mdi-arrow-expand-down"
        />
        <em
          v-show="showMinimizeIcon"
          class="icon mdi mdi-arrow-expand-up"
        />
      </div>
    </footer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import VueContext from 'vue-context/src/js/index'
import ffish from 'ffish'
import { Chessground } from 'chessgroundx'

export default {
  components: {
    VueContext
  },
  data () {
    return {
      lines: [],
      engineInfo: {
        name: '',
        author: '',
        options: []
      },
      multipvMulti: [
        {
          cp: 0,
          pv: '',
          ucimove: ''
        }
      ],
      previewLineId: null, // Shows which PV line is being previewed
      previewTop: 0,
      previewLeft: 0,
      previewUciIdx: null,
      displayIdx: null,
      previewFen: null,
      previewBoard: null,
      currentEngine: 1,
      pvcount: 0,
      originalMultiPV: 1,
      showOnlyOnePvLine: false, // Flag to show only one PvLine
      showExpandIcon: false, // Flag to show expand-down icon
      showMinimizeIcon: true, // Flag to show expand-up icon
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
      board: null
    }
  },
  computed: {
    engineDetails () {
      if (this.currentEngine === 1) {
        const { engineName, engineAuthor } = this.$store.getters
        return `"${engineName}" ${engineAuthor ? 'by ' + engineAuthor : ''}`
      } else {
        const engineName = this.engineInfo.name
        const engineAuthor = this.engineInfo.author
        return `"${engineName}" ${engineAuthor ? 'by ' + engineAuthor : ''}`
      }
    },
    currentMove () {
      for (let num = 0; num < this.moves.length; num++) {
        if (this.moves[num].fen === this.fen) {
          return this.moves[num]
        }
      }
      return null
    },
    ...mapGetters(['boardStyle', 'pieceStyle', 'dimensionNumber', 'moves', 'fen', 'is960', 'variant', 'orientation', 'multipv', 'engineSettings', 'mainFirstMove', 'PvE', 'active', 'turn', 'enginetime', 'PvEValue', 'PvEParam', 'PvEInput', 'nodes', 'depth', 'seldepth'])
  },
  watch: {
    pvcount () {
      let i
      this.lines = []
      for (i = 0; i < this.pvcount; i++) {
        this.lines.push(0)
      }
    },
    multipvMulti () {
      this.updateMultiLines()
    },
    multipv () {
      this.updateLines()
    },
    engineSettings () {
      this.originalMultiPV = this.engineSettings.MultiPV
      this.updateLines()
    },
    nodes () {
      if (this.active && this.PvE && !this.turn) {
        if (this.PvEValue === 'nodes') {
          if (this.nodes >= (this.PvEInput)) {
            this.onClick(this.lines[0])
          }
        }
      }
    },
    depth () {
      if (this.active && this.PvE && !this.turn) {
        if (this.PvEValue === 'depth') {
          if (this.depth >= (this.PvEInput)) {
            this.onClick(this.lines[0])
          }
        }
      }
    }
  },
  methods: {
    ensurePreviewBoard () {
      const el = Array.isArray(this.$refs.previewBoard)
        ? this.$refs.previewBoard[0]
        : this.$refs.previewBoard
      if (!el) return

      if (!this.previewBoard || this.previewBoard.state.geometry !== this.dimensionNumber) {
        this.previewBoard = Chessground(el, {
          coordinates: false,
          fen: this.previewFen || this.fen,
          orientation: this.orientation,
          highlight: { lastMove: false, check: false },
          drawable: { enabled: false, visible: false },
          movable: { enabled: false },
          geometry: this.dimensionNumber
        })
      }
    },
    updatePreviewFen () {
      if (!this.previewFen) return
      this.ensurePreviewBoard()
      if (this.previewBoard) {
        this.previewBoard.set({ fen: this.previewFen, variant: this.variant, lastMove: false })
      }
    },
    // initBoard () {
    //   if (this.variant === 'shogi') {
    //     this.piecesW = this.shogiPiecesW
    //     this.piecesB = this.shogiPiecesB
    //   }
    //   if (this.variant === 'crazyhouse') {
    //     this.piecesW = this.chessPiecesW
    //     this.piecesB = this.chessPiecesB
    //   }
    //   const el = Array.isArray(this.$refs.previewBoard)
    //   ? this.$refs.previewBoard[0]
    //   : this.$refs.previewBoard
    //   if (!el) return
    //   if (!this.board || this.board.state.geometry !== this.dimensionNumber) {
    //     this.board = Chessground(el, {
    //       coordinates: true,
    //       fen: this.fen,
    //       turnColor: 'white',
    //       resizable: true,
    //       highlight: {
    //         lastMove: true, // add last-move class to squares
    //         check: false // add check class to squares
    //       },
    //       drawable: {
    //         enabled: false, // cannot draw
    //       },
    //       movable: {
    //         enabled:false,
    //       },
    //       orientation: this.orientation,
    //       geometry: this.$store.getters.dimensionNumber
    //     })

    //     document.body.dispatchEvent(new Event('chessground.resize'))
    //   }
    //   if (this.variant === 'crazyhouse' || this.variant === 'shogi') {
    //     document.body.dispatchEvent(new Event('chessground.resize'))
    //   }
    //   this.board.set({
    //     variant: this.variant,
    //     lastMove: false
    //   })
    // },
    fillpvCount (payload) {
      this.pvcount = payload
      this.originalMultiPV = payload
    },
    currentEngineIndex (payload) {
      this.currentEngine = payload
    },
    fillPV (payload) {
      this.multipvMulti = payload
    },
    fillInfo (payload) {
      this.engineInfo = payload
    },
    asMain (target, data) {
      const mainLine = data.line.pvUCI.split(' ')
      const prevMov = this.currentMove
      console.log(mainLine)
      this.$store.dispatch('pushMainLine', { line: mainLine, prev: prevMov })
    },
    asAlt (target, data) {
      const mainLine = data.line.pvUCI.split(' ')
      const prevMov = this.currentMove
      this.$store.dispatch('pushAltLine', { line: mainLine, prev: prevMov })
    },
    computePreviewFen (baseFen, pvUciMoves, plyCount) {
      const b = this.is960
        ? new ffish.Board(this.variant, baseFen, true)
        : new ffish.Board(this.variant, baseFen)

      for (let i = 0; i < plyCount; i++) {
        b.push(pvUciMoves[i])
      }
      return b.fen()
    },
    countMovesUpTo (entries, displayIdx) {
      console.log(entries)
      let moveNum = 0
      for (let i = 0; i <= displayIdx; i++) {
        if (this.isMoveToken(entries[i])) {
          moveNum++
        }
      }
      console.log(moveNum)
      return moveNum
    },
    setPreview (lineId, displayIdx, entries, event) {
      const previewIdx = this.previewIndex(displayIdx, entries)
      if (previewIdx === null) {
        this.clearPreview()
        return
      }

      this.updatePreviewPosition(event)
      const uciIndex = this.countMovesUpTo(entries, previewIdx)
      this.previewLineId = lineId
      this.previewUciIdx = uciIndex
      this.displayIdx = previewIdx

      const uciMoves = this.lines[lineId].pvUCI.trim().split(/\s+/)
      const plyCount = uciIndex
      try {
        this.previewFen = this.computePreviewFen(this.fen, uciMoves, plyCount)
        this.$nextTick(() => this.updatePreviewFen())
      } catch (e) {
        this.clearPreview()
      }
    },
    setBoard (lineId, displayIdx, entries) {
      const previewIdx = this.previewIndex(displayIdx, entries)
      const uciIndex = this.countMovesUpTo(entries, previewIdx)
      
      this.previewLineId = lineId
      this.previewUciIdx = uciIndex
      this.displayIdx = previewIdx

      const uciMoves = this.lines[lineId].pvUCI.trim().split(/\s+/)
      const plyCount = uciIndex
      try {
        const fallbackFEN = this.fen
        for (let i = 0; i < plyCount; i++) {
          const prevMov = this.currentMove
          this.$store.dispatch('push', { move: uciMoves[i], prev: prevMov })
        }
      } catch (e) {
        this.$store.commit('hoveredpv', -1)
        this.$store.dispatch('fen', fallbackFEN)
      }
      this.clearPreview()
    },
    updatePreviewPosition (event) {
      const pvLinesEl = this.$refs.pvLines
      if (!pvLinesEl || !event || !event.currentTarget) return

      const lineEl = event.currentTarget.closest('.item')
      if (!lineEl) return

      const pvRect = pvLinesEl.getBoundingClientRect()
      const lineRect = lineEl.getBoundingClientRect()
      this.previewTop = lineRect.bottom - pvRect.top
      this.previewLeft = lineRect.left - pvRect.left
    },
    clearPreview () {
      this.previewLineId = null
      this.displayIdx = null
      this.previewUciIdx = null
      this.previewFen = null
      this.previewBoard = null
      this.previewTop = 0
      this.previewLeft = 0
    },
    previewIndex (displayIdx, entries) {
      const entry = entries[displayIdx]
      if (this.isMoveNumber(entry)) {
        return this.nextMoveIndex(displayIdx + 1, entries)
      }
      if (!this.isMoveToken(entry)) {
        return null
      }
      return displayIdx
    },
    nextMoveIndex (startIdx, entries) {
      for (let idx = startIdx; idx < entries.length; idx++) {
        if (this.isMoveToken(entries[idx])) {
          return idx
        }
      }
      return null
    },
    isMoveNumber (entry) {
      return /^\d+\.+$/.test(entry) // Match move numbers like "1." or "12..."
    },
    isMoveToken (entry) {
      return entry.length > 0 && !this.isMoveNumber(entry)
    },
    onMouseEnter (id) {
      this.$store.commit('hoveredpv', id)
      this.ensurePreviewBoard()
    },
    onMouseLeave () {
      this.clearPreview()
      this.$store.commit('hoveredpv', -1)
    },
    onClick (line) {
      this.$store.commit('hoveredpv', -1)
      const prevMov = this.currentMove
      this.$store.dispatch('push', { move: line.ucimove, prev: prevMov })
    },
    updateLines () {
      if (this.currentEngine === 1) {
        const count = this.engineSettings.MultiPV
        const lines = this.multipv.filter(el => typeof el.pv === 'string' && el.pv.length > 0)
        this.lines = lines.concat(Array(count ? Math.max(0, count - lines.length) : 0).fill(null))
        if (this.showOnlyOnePvLine) {
          this.lines = this.lines.slice(1, 2)
        }
      }
    },
    updateMultiLines () {
      if (this.currentEngine !== 1) {
        const count = this.pvcount
        const lines = this.multipvMulti.filter(el => typeof el.pv === 'string' && el.pv.length > 0)
        this.lines = lines.concat(Array(count ? Math.max(0, count - lines.length) : 0).fill(null))
        if (this.showOnlyOnePvLine) {
          this.lines = this.lines.slice(1, 2)
        }
      }
    },
    toggle () {
      this.showExpandIcon = !this.showExpandIcon
      this.showMinimizeIcon = !this.showMinimizeIcon
      this.showOnlyOnePvLine = !this.showOnlyOnePvLine
      if (this.currentEngine === 1) {
        this.updateLines()
      } else {
        this.updateMultiLines()
      }
    }
  }
}
</script>

<style scoped>
.pv-lines {
  background-color: var(--second-bg-color);
  border: 1px solid var(--main-border-color);
  font-weight: 100;
  overflow: visible;
  position: relative;
  white-space: nowrap;
}
.pv-entry.is-move-token:hover {
  font-weight: bold;
}
.pv-preview {
  display: inline-block;  
  position: absolute;
  z-index: 20;
  border-radius: 6px;
  overflow: hidden;
  filter: drop-shadow(4px 4px 3px black)
}

.pv-preview .cg-wrap {
  width: 160px;
  height: 160px;
}

.scroller {
  max-height: 12em;
  overflow-x: scroll;
}

.list {
  min-width: 100%;
  display: table;
}
.item {
  height: 2em;
  padding: 5px;
  display: flex;
  flex-direction: row;
  align-items: center;
  user-select: none;
}
.item + .item {
  border-top: 1px solid var(--main-border-color);
}
.item.clickable {
  cursor: pointer;
}
.item.clickable:hover {
  background-color: var(--dark-highlight-color);
}
.item > .left {
  margin-right: 5px;
  font-family: sans-serif;
  font-weight: 1000;
  text-align: center;
}
.item > .right {
  text-align: left;
  flex: 0 0 auto;
}
.item.placeholder {
  font-family: sans-serif;
  justify-content: center;
}

.footer {
  display: flex;
}

.details {
  border-top: 1px solid var(--main-border-color);
  font-size: 8pt;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  font-style: oblique;
  flex-grow: 1;
}

.collapsible {
  color: var(--light-text-color);
  background-color: var(--button-color);
  padding: 1px;
  border: 2px solid var(--main-border-color);
  text-decoration: none;
  cursor: pointer;
  width: 20px;
  border: none;
  text-align: right;
  outline: none;
  font-size: 12px;
  text-align: center;
}

.collapsible:hover {
  background-color: var(--hover-color);
}
</style>
