<template>
  <div class="jump-buttons">
    <a
      href="#"
      class="jump previous"
      :class="{ grey : variant === 'racingkings' }"
      @click="$emit('flip-board', 0)"
    ><i
      slot="extra"
      class="icon mdi mdi-rotate-3d-variant"
    /></a>
    <a
      href="#"
      class="jump previous"
      :class="{ grey : !currentMove }"
      @click="$emit('move-to-start', 0)"
    ><i
      slot="extra"
      class="icon mdi mdi-skip-backward"
    /></a>
    <a
      href="#"
      class="jump previous"
      :class="{ grey : !currentMove }"
      @click="$emit('move-back-one', 0)"
    ><i
      slot="extra"
      class="icon mdi mdi-skip-previous"
    /></a>
    <a
      href="#"
      class="jump next"
      :class="{ grey : moves.length === 0 || ( currentMove && !currentMove.main ) }"
      @click="$emit('move-forward-one', 0)"
    ><i
      slot="extra"
      class="icon mdi mdi-skip-next"
    /></a>
    <a
      href="#"
      class="jump next"
      :class="{ grey : moves.length === 0 || ( currentMove && !currentMove.main ) }"
      @click="$emit('move-to-end', 0)"
    ><i
      slot="extra"
      class="icon mdi mdi-skip-forward"
    /></a>
  </div>
</template>

<script>
// raw vue component
// TODO: use HookIcon component?
// import HookIcon from 'mdi-vue/Hook.vue'

export default {
  name: 'JumpButtons',
  components: {
    // HookIcon
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
    variant () {
      return this.$store.getters.variant
    },
    moves () {
      return this.$store.getters.moves
    },
    fen () {
      return this.$store.getters.fen
    }
  }
}
</script>

<style scoped>
i {
  font-size: 22pt;
  text-align: center;
}
.jump-buttons {
  align-items: center;
  text-align: center;
}
.jump {
  align-items: center;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  align: center;
  font-size: 24pt;
  width: 70px;
  height: 40px;
  color: var(--main-text-color);
  border-radius: 5px 5px 5px 5px;
}
.jump:hover {
  background-color: var(--hover-highlight-color);
  color: white;
}
.round {
  border-radius: 90%;
}
.grey {
  color:gray
}
.grey:hover {
  background-color: var(--main-bg-color);
  color: gray;
  cursor: default;
}
</style>
