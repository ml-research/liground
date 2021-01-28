<template>
  <span
    id="move-node"
    :class="{ variation : isVariation }"
  >
    <span
      v-if="move.ply % 2 == 1 "
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
    <span v-if="move.next">
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
    }
  },
  computed: {
    isVariation () {
      console.log(this.move)
      return this.move.prev && this.move.fen !== this.move.prev.main.fen
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
