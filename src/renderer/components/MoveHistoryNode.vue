<template>
  <span
    id="move-node"
    :class="{ variation : isVariation }"
  >
    <span
      v-if="move.ply % 2 == 1"
      class="move-number"
    >
      {{ (move.ply+1) / 2 }}.
    </span>
    <span
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
      />
      <move-history-node
        v-if="move.main.main"
        :move="move.main.main"
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
    }
  },
  computed: {
    isVariation () {
      console.log(this.move)
      return this.move.prev && this.move.fen !== this.move.prev.main.fen
    },
    filteredNext () {
      return this.move.next.filter((variation) => {
        return variation.fen !== this.move.main.fen
      })
    }
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
</style>
