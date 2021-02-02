<template>
  <span
    id="move-node"
  >
    <span
      v-if="move.ply % 2 == 1 && printRoot"
      class="move-number"
    >
      {{ (move.ply+1) / 2 }}.
    </span>
    <span
      v-else-if="move.ply % 2 == 0 && beginVariation"
      class="move-number"
    >
      {{ (move.ply) / 2 }}...
    </span>
    <span
      v-if="printRoot"
      class="move-name"
      :class="{current : move.current}"
      @click="updateBoard(move)"
    >
      {{ move.name }}
    </span>
    <span v-if="move.fen === mainFirstMove.fen">
      <move-history-node
        v-for="variation in firstMovesFiltered"
        :key="variation.fen"
        :move="variation"
        :begin-variation="true"
        class="variation"
      />
    </span>
    <span v-if="followLine && move.next.length > 1">
      <move-history-node
        :move="move.main"
        :follow-line="false"
      />
      <move-history-node
        v-for="variation in filteredNext"
        :key="variation.fen"
        :move="variation"
        :begin-variation="true"
        class="variation"
      />
      <move-history-node
        :move="move.main"
        :begin-variation="false"
        :print-root="false"
      />
    </span>
    <span v-else-if="followLine">
      <move-history-node
        v-for="variation in move.next"
        :key="variation.fen"
        :move="variation"
      />
    </span>
  </span>
</template>

<script>
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
      for (const num in this.moves) {
        if (this.moves[num].current) {
          this.moves[num].current = false
          break
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
  background-color:#444;
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
