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
      :class="{ current : move.fen === fen }"
      @click="updateBoard(move)"
    >
      {{ checkCheckmate(move).name }}
    </span>
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

export default {
  name: 'MoveHistoryNode',
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
    firstMovesFiltered () {
      return this.firstMoves.filter((move) => {
        return move.fen !== this.mainFirstMove.fen
      })
    }
  },
  methods: {
    updateBoard (move) {
      this.$store.dispatch('fen', this.move.fen)
    },
    checkCheckmate (moveIn) {
      const move = moveIn
      let name = moveIn.name
      const variant = this.$store.getters.variant
      const board = new ffish.Board(variant, move.fen)
      const legalMoves = board.legalMoves
      if (legalMoves.length === 0) {
        name = name + '#'
      }
      return name
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
