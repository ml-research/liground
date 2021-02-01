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
      @click="updateBoard"
    >
      {{ move.name }}
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
      console.log('filter move next')
      console.log(this.move)
      return this.move.next.filter((variation) => {
        return variation.fen !== this.move.main.fen
      })
    }
  },
  created () {
    console.log(this.move)
  },
  methods: {
    updateBoard () {
      this.$store.dispatch('fen', this.move.fen)
    }
  }
}
</script>

<style scoped>
.move-number {
  color: #777;

}
.move-name {
  margin-right: 4px;
  pointer-events: auto;
}
.variation {
  background-color: mediumseagreen;
  display: block;
}
.variation::before {
  content: "(";
}
.variation::after {
  content: ")";
}
</style>
