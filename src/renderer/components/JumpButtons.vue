<template>
  <div class="jump-buttons">
    <a
      href="#"
      class="jump previous"
      :class="{ grey : variant === 'racingkings' }"
      @click="$emit('flip-board', 0)"
    >
      <Rotate3dVariant />
    </a>
    <a
      href="#"
      class="jump previous"
      :class="{ grey : !currentMove }"
      @click="$emit('move-to-start', 0)"
    >
      <SkipBackward />
    </a>
    <a
      href="#"
      class="jump previous"
      :class="{ grey : !currentMove }"
      @click="$emit('move-back-one', 0)"
    >
      <SkipPrevious />
    </a>
    <a
      href="#"
      class="jump next"
      :class="{ grey : moves.length === 0 || ( currentMove && !currentMove.main ) }"
      @click="$emit('move-forward-one', 0)"
    >
      <SkipNext />
    </a>
    <a
      href="#"
      class="jump next"
      :class="{ grey : moves.length === 0 || ( currentMove && !currentMove.main ) }"
      @click="$emit('move-to-end', 0)"
    >
      <SkipForward />
    </a>
  </div>
</template>

<script>
// raw vue component
// TODO: use HookIcon component?
// import HookIcon from 'mdi-vue/Hook.vue'
import SkipForward from 'vue-material-design-icons/SkipForward.vue'
import SkipBackward from 'vue-material-design-icons/SkipBackward.vue'
import SkipNext from 'vue-material-design-icons/SkipNext.vue'
import SkipPrevious from 'vue-material-design-icons/SkipPrevious.vue'
import Rotate3dVariant from 'vue-material-design-icons/Rotate3dVariant.vue'

export default {
  name: 'JumpButtons',
  components: {
    SkipForward, SkipBackward, SkipNext, SkipPrevious, Rotate3dVariant
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
.jump-buttons {
  align-items: center;
  text-align: center;
  font-size: 22pt;
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
  background-color: #2196F3;
  color: white;
}
.next {
  color: black;
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
