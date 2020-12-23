<template>
  <div class="jump-buttons">
<a href="#" class="jump previous" @click="$emit('flip-board', 0)"><i slot="extra" class="icon mdi mdi-rotate-3d-variant"/></a>
<a href="#" class="jump previous" v-bind:class='{grey : currentMove == 0}' @click="$emit('move-to-start', 0)"><i slot="extra" class="icon mdi mdi-skip-backward"/></a>
<a href="#" class="jump previous" v-bind:class='{grey : currentMove == 0}' @click="$emit('move-back-one', 0)"><i slot="extra" class="icon mdi mdi-skip-previous"/></a>
<a href="#" class="jump next"     v-bind:class='{grey : currentMove == $store.getters.moves.length-1}' @click="$emit('move-forward-one', 0)"><i slot="extra" class="icon mdi mdi-skip-next"/></a>
<a href="#" class="jump next"     v-bind:class='{grey : currentMove == $store.getters.moves.length-1}' @click="$emit('move-to-end', 0)"><i slot="extra" class="icon mdi mdi-skip-forward"/></a>
  </div>

</template>

<script>
import HookIcon from 'mdi-vue/Hook.vue' // raw vue component

export default {
  name: 'JumpButtons',
  components: {
    HookIcon
  },
  computed: {
    moves () {
      return this.$store.getters.moves
    },
    currentMove () {
      let fen = this.$store.getters.fen
      for ( const move of this.moves) {
        console.log(move.fen)
        if(move.fen == fen) {
          console.log('success: ' + move.fen)
          return move.ply
        }
      }
      return 0;
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
  color: #2c3e50;
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
</style>
