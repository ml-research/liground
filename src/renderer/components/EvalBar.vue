<template>
  <div
    class="progress"
    :class="{ flip : orientation === 'black' }"
  >
    <div
      class="progress-value"
      :style="{ height: `${100 - cpForWhitePerc * 100}%` }"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'EvalBar',
  computed: {
    ...mapGetters(['orientation', 'cpForWhitePerc'])
  }
}
</script>

<style scoped>
.progress {
  position: relative;
  width: 22px;
  height: 600px;
  background: var(--second-bg-color);
  border: 1px solid var(--main-border-color);
  border-radius: 5px;
  overflow: hidden;
}
.progress::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  margin-top: -1px;
  background: var(--eval-line-color);
  opacity: .7;
}
.flip {
  transform: scaleY(-1);
}

.progress-value {
  width: 100%;
  height: 50%;
  background: var(--main-text-color);
  transition: height .25s ease;
}
</style>
