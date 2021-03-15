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
      v-else-if="move.ply % 2 === 0 && printRoot
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
      :class="{ current : move.current }"
      @click="updateBoard(move)"
      @contextmenu.prevent="$refs.menu.open"
    >
      {{ move.name }}
    </span>
    <VueContext ref="menu">
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
    }
  },
  methods: {
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
    currentMove () {
      for (const idx in this.moves) {
        if (this.moves[idx].current) {
          console.log(this.moves[idx])
          return this.moves[idx]
        }
      }
      return null
    },
    promote (move) {
      let mov = move
      while (mov.prev) { // promote at every "fork"
        mov.prev.main = mov
        mov = mov.prev
      }
    },
    deleteMove (move) {
      const currentMove = this.currentMove()
      this.$store.dispatch('deleteFromMoves', move)
      const currentLine = this.currentLine(move)
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
          if (this.firstMoves.length === 0) {
            this.$store.dispatch('resetBoard', { is960: this.is960 })
          } else {
            this.$store.dispatch('mainFirstMove', this.firstMoves[0])
            if (currentLine.includes(currentMove)) {
              this.updateBoard(this.firstMoves[0])
            }
          }
        } else {
          if (currentLine.includes(currentMove)) {
            this.updateBoard(this.mainFirstMove)
          }
        }
      }
    },
    updateBoard (move) {
      this.$store.dispatch('fen', move.fen)
      for (const num in this.moves) {
        if (this.moves[num].current) {
          this.moves[num].current = false
        }
      }
      move.current = true
    }
  }
}
</script>

<style scoped>
.move-name:hover {
  background-color: #2196F3;
  cursor: pointer;
  border-radius: 4px 4px 4px 4px;
  color: #fff;
}
.move-name.current{
  background-color:#2196F3;
  border-radius: 4px 4px 4px 4px;
  color: #fff;
}
.move-number {
  color: #777;
}
.move-name {
  margin-right: 4px;
  pointer-events: auto;
}
.variation {
  background-color:lightgray;
  display: block;
}
.variation::before {
  content: "(";
}
.variation::after {
  content: ")";
}
</style>
