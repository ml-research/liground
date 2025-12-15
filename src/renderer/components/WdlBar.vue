<template>
    <div class="wdl-bar" style="width:10px;height:100px;background:red"></div>
  <!-- <div v-if="wdl" class="wdl-bar">
    <div class="loss" :style="{ height: wdl.loss * 100 + '%' }"></div>
    <div class="draw" :style="{ height: wdl.draw * 100 + '%' }"></div>
    <div class="win"  :style="{ height: wdl.win  * 100 + '%' }"></div>
  </div> -->
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'WdlBar',
  computed: {
    ...mapGetters(['wdlForWhite']),
    wdl () { return this.wdlForWhite }
  }
}
</script>

<style scoped>
.wdl-bar {
  display: flex;
  flex-direction: column;
  width: 10px;
  height: 100%;
}
.win  { background: #fff; }
.draw { background: #aaa; }
.loss { background: #000; }
</style>
