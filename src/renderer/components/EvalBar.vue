<template>
  <div
    class="progress"
    :class="{ flip : $store.getters.orientation === 'black' }"
  >
    <div
      class="progress-value"
      :style="{ height: `${cpForWhitePerc * 100}%` }"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'EvalBar',
  computed: {
    ...mapGetters(['cpForWhitePerc'])
  }
}
</script>

<style scoped>
.progress {
  width: 17px;
  height: 600px;
  background: #fff;
  border: 1px solid #888;
  border-radius: 5px;
  overflow: hidden;
}
.flip {
  transform: scaleY(-1);
}

.progress-value {
  width: 100%;
  height: 50%;
  background: #111;
  transition: height .15s;
}
</style>
