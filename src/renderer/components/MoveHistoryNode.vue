<template>
  <span
    id="move-node"
  >
    <span
      v-if="move.ply % 2 === 1 && printRoot"
      class="move-number"
    >
      {{ (move.ply+1) / 2 }}.
    </span>
    <span
      v-else-if="(move === mainFirstMove) || move.ply % 2 === 0 && printRoot
        &&(beginVariation || move.prev && (move.prev.prev && move.prev.prev.main === move.prev && move.prev.prev.next.length > 1)
          || (firstMoves.includes(move.prev) && firstMoves.length > 1 && mainFirstMove.next.length > 0 && (move.prev === mainFirstMove || move.prev.main !== move) )
          && move.prev.main === move)"
      class="move-number"
    >
      {{ (move.ply) / 2 }}...
    </span>
    <span
      v-if="printRoot"
      class="move-name"
      :class="{ current : move.fen === fen }"
      @click="updateBoard(move)"
      @contextmenu.prevent="(menuAtMove === move.name || displayMenu) ? $refs.menu.open($event, { name: move.name }) : dummy"
    >
      {{ checkCheckmate }}
    </span>
    <VueContext
      ref="menu"
      @open="onOpen($event, { move: move })"
      @close="onClose"
    >
      <li>
        <a
          v-if="!mainLine.includes(move)"
          href="#"
          @click.prevent="promote(move)"
        >Promote Variation</a>
      </li>
      <li>
        <a
          href="#"
          @click.prevent="deleteMove(move)"
        >Delete Variation</a>
      </li>
    </VueContext>
    <span v-if="move.fen === mainFirstMove.fen">
      <MoveHistoryNode
        v-for="variation in firstMovesFiltered"
        :key="variation.fen"
        :move="variation"
        :begin-variation="true"
        class="variation"
      />
    </span>
    <span v-if="followLine && move.next.length > 1">
      <MoveHistoryNode
        :move="move.main"
        :follow-line="false"
        class="case1"
      />
      <MoveHistoryNode
        v-for="variation in filteredNext"
        :key="variation.fen"
        :move="variation"
        :begin-variation="true"
        class="variation case2"
      />
      <MoveHistoryNode
        :move="move.main"
        :begin-variation="false"
        :print-root="false"
        class="case3"
      />
    </span>
    <span v-else-if="followLine">
      <MoveHistoryNode
        v-for="variation in move.next"
        :key="variation.fen"
        :move="variation"
        class="case4"
      />
    </span>
  </span>
</template>

<script>

import ffish from 'ffish'
import VueContext from 'vue-context/src/js/index'

export default {
  name: 'MoveHistoryNode',
  components: {
    VueContext
  },
  props: {
    move: {
      default: undefined,
      type: Object
    },
    followLine: {
      default: true,
      type: Boolean
    },
    printRoot: {
      default: true,
      type: Boolean
    },
    beginVariation: {
      default: false,
      type: Boolean
    }
  },
  computed: {
    displayMenu () {
      return this.$store.getters.displayMenu
    },
    menuAtMove () {
      return this.$store.getters.menuAtMove
    },
    mainLine () {
      const result = []
      if (this.mainFirstMove) {
        let mov = this.mainFirstMove
        result.push(mov)
        while (mov.main) {
          mov = mov.main
          result.push(mov)
        }
      }
      return result
    },
    filteredNext () {
      return this.move.next.filter((variation) => {
        return variation.fen !== this.move.main.fen
      })
    },
    moves () {
      return this.$store.getters.moves
    },
    mainFirstMove () {
      return this.$store.getters.mainFirstMove
    },
    fen () {
      return this.$store.getters.fen
    },
    firstMoves () {
      return this.$store.getters.firstMoves
    },
    startFen () {
      return this.$store.getters.startFen
    },
    is960 () {
      return this.$store.getters.is960
    },
    firstMovesFiltered () {
      return this.firstMoves.filter((move) => {
        return move.fen !== this.mainFirstMove.fen
      })
    },
    legalMoves () {
      return this.$store.getters.legalMoves
    },
    checkCheckmate () {
      let name = this.move.name
      const variant = this.$store.getters.variant
      const board = new ffish.Board(variant, this.move.fen)
      const legalMoves = board.legalMoves()
      if (legalMoves.length === 0 && !name.includes('#') && this.move.prev && this.move.prev.prev && this.move.prev.prev.name.includes('+')) {
        name = this.move.name + '#'
      }
      return name
    }
  },
  watch: {
    moves () {
      this.$store.dispatch('displayMenu', true)
      this.$store.dispatch('menuAtMove', null)
    }
  },
  methods: {
    dummy () {
      return null
    },
    onOpen (event, data) {
      if (this.displayMenu) {
        this.$store.dispatch('menuAtMove', data.move)
        this.$store.dispatch('displayMenu', false)
      }
    },
    onClose () {
      this.$store.dispatch('displayMenu', true)
      this.$store.dispatch('menuAtMove', null)
    },
    currentLine (move) {
      const result = []
      if (this.mainFirstMove) {
        let movPrev = move.prev
        let movNext = move.main
        result.push(move)
        while (movPrev) {
          result.push(movPrev)
          movPrev = movPrev.prev
        }
        while (movNext) {
          result.push(movNext)
          movNext = movNext.main
        }
      }
      return result
    },
    movesToDelete (move) {
      const result = []
      if (this.mainFirstMove) {
        let movNext = move.main
        result.push(move)
        while (movNext) {
          result.push(movNext)
          movNext = movNext.main
        }
      }
      return result
    },
    currentMove () {
      for (const idx in this.moves) {
        if (this.moves[idx].fen === this.fen) {
          return this.moves[idx]
        }
      }
      return null
    },
    promote (move) {
      const moves = this.$store.getters.moves
      this.$store.dispatch('movesChangeDummy', moves)
      const movesToDelete = this.movesToDelete(move)
      if (movesToDelete.includes(this.menuAtMove)) {
        this.$store.dispatch('displayMenu', true)
        this.$store.dispatch('menuAtMove', null)
      }
      let mov = move
      while (mov.prev) { // promote at every "fork"
        mov.prev.main = mov
        mov = mov.prev
      }
      if (!mov.prev) {
        this.$store.dispatch('mainFirstMove', mov)
      }
    },
    deleteMove (move) {
      const currentMove = this.currentMove()
      const currentLine = this.currentLine(move)
      const movesToDelete = this.movesToDelete(move)
      if (movesToDelete.includes(this.menuAtMove)) {
        this.$store.dispatch('displayMenu', true)
        this.$store.dispatch('menuAtMove', null)
      }
      if (move.prev) {
        const moveIndex = move.prev.next.indexOf(move)
        if (move.prev.main === move) { // ensure we still have a main line if there are still continuations
          if (move.prev.next.length > 1) {
            if (move === move.prev.next[0]) {
              move.prev.main = move.prev.next[1]
            } else {
              move.prev.main = move.prev.next[0]
            }
          } else {
            move.prev.main = undefined
          }
        }
        move.prev.next.splice(moveIndex, 1)
        if (currentLine.includes(currentMove)) {
          this.updateBoard(move.prev)
        }
      } else {
        if (this.mainFirstMove === move) {
          if (this.firstMoves.length === 1) {
            this.$store.dispatch('resetBoard', { is960: this.is960 })
          } else {
            if (this.firstMoves[0] === move) {
              this.$store.dispatch('mainFirstMove', this.firstMoves[1])
            } else {
              this.$store.dispatch('mainFirstMove', this.firstMoves[0])
            }
            if (currentLine.includes(currentMove)) {
              this.updateBoard(this.mainFirstMove)
            }
          }
        } else {
          if (currentLine.includes(currentMove)) {
            this.updateBoard(this.mainFirstMove)
          }
        }
      }
      this.$store.dispatch('deleteFromMoves', move)
    },
    updateBoard (move) {
      this.$store.dispatch('fen', move.fen)
    }
  }
}
</script>

<style scoped>
.move-name:hover {
  background-color: var(--dark-highlight-color);
  cursor: pointer;
  border-radius: 4px 4px 4px 4px;
  color: var(--light-text-color);
}
.move-name.current{
  background-color: var(--dark-highlight-color);
  border-radius: 4px 4px 4px 4px;
  color: var(--light-text-color);
}
.move-number {
  color: var(--main-text-color);
}
.move-name {
  margin-right: 4px;
  pointer-events: auto;
  font-family: 'Noto Chess', sans-serif;
}
.variation {
  background-color:var(--variation-color);
  display: block;
}
.variation::before {
  content: "(";
}
.variation::after {
  content: ")";
}
</style>
