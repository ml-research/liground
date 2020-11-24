<template>
  <div class="jump-buttons">
<a href="#" class="jump previous" @click="$emit('flip-board', 0)"><i slot="extra" class="icon mdi mdi-rotate-3d-variant"/></a>
<a href="#" class="jump previous"><i slot="extra" class="icon mdi mdi-skip-backward"/></a>
<a href="#" class="jump previous"><i slot="extra" class="icon mdi mdi-skip-previous"/></a>
<a href="#" class="jump next"    ><i slot="extra" class="icon mdi mdi-skip-next"/></a>
<a href="#" class="jump next"    ><i slot="extra" class="icon mdi mdi-skip-forward"/></a>
  </div>

</template>

<script>
import HookIcon from 'mdi-vue/Hook.vue' // raw vue component

export default {
  name: 'JumpButtons',
  components: [
    HookIcon
  ]
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
</style>
