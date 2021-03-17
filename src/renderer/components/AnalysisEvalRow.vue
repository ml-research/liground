<template>
  <div class="container">
    <div
      class="eval"
      :class="{ smaller: cpForWhiteStr.includes('/') }"
    >
      {{ cpForWhiteStr }}
    </div>
    <EngineSelect class="select" />
    <RoundedSwitch class="switch" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import RoundedSwitch from './RoundedSwitch'
import EngineSelect from './EngineSelect'

export default {
  name: 'AnalysisEvalRow',
  components: { RoundedSwitch, EngineSelect },
  computed: {
    ...mapGetters(['cpForWhiteStr'])
  }
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: stretch;
  margin: 10px 0;
  border-radius: 3px;
  text-align: center;
}
.container > * {
  margin: 0 5px;
}

.eval {
  font-size: 2em;
}
.smaller {
  font-size: 1.5em !important;
}
.select {
  flex-basis: auto;
  flex-shrink: 1;
  flex-grow: 1;
}

.switch {
  flex-basis: 60px;
  flex-shrink: 0;
  flex-grow: 0;
}

</style>
