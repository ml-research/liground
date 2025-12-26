<template>
  <div class="eval-bars" :class="{ flip: orientation === 'black' }">
    <div class="progress">
      <div
        class="progress-value"
        :style="{ height: `${100 - cpForWhitePerc * 100}%` }"
      />
    </div>
    <div class="wdl">
      <div class="wdl-seg wdl-win" :style="{ height: `${wdlWinPct}%` }" />
      <div class="wdl-seg wdl-draw" :style="{ height: `${wdlDrawPct}%` }" />
      <div class="wdl-seg wdl-loss" :style="{ height: `${wdlLossPct}%` }" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'EvalBar',
  computed: {
    ...mapGetters(['orientation', 'cpForWhitePerc', 'cpForWhite', 'wdlForWhiteWinPct', 'wdlForWhiteDrawPct', 'wdlForWhiteLossPct']),
    
    wdlWinPct () {
      return this.wdlForWhiteWinPct ?? 0
    }, 
    wdlDrawPct () {
      return this.wdlForWhiteDrawPct ?? 0
    },
    wdlLossPct () {
      return this.wdlForWhiteLossPct ?? 0
    }
  }
}
</script>

<style scoped>
.eval-bars {
  display: flex;
  gap: 6px;
  align-items: stretch;
}
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

.wdl {
  width: 22px;
  height: 600px;
  border: 1px solid var(--main-border-color);
  border-radius: 5px;
  overflow: hidden;
  background: var(--second-bg-color);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
.wdl-seg {
  width: 100%;
  transition: height .25s ease;
}
.wdl-win { background: #4caf50; }
.wdl-draw { background: #f4c542; }
.wdl-loss { background: #e84c3d; }
</style>
