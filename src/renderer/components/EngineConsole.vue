<template>
  <div class="container">
    <RecycleScroller
      ref="scroller"
      v-slot="{ item }"
      class="console"
      :items="io"
      :item-size="11"
    >
      {{ item }}
    </RecycleScroller>
    <input
      v-model="cmd"
      class="input"
      type="text"
      size="60"
      @keyup="onKeyup"
    >
  </div>
</template>

<script>
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import engine from '../engine'

export default {
  name: 'EngineConsole',
  components: {
    RecycleScroller
  },
  data () {
    return { cmd: '', io: Object.freeze([]) }
  },
  mounted () {
    // TODO: more elegant way?
    this.$store.subscribe((mutation) => {
      if (mutation.type === 'clearIO') {
        this.io = Object.freeze([])
      }
    })
    engine.on('input', line => this.appendLine(`> ${line}`))
    engine.on('output', line => this.appendLine(line))
  },
  methods: {
    appendLine (line) {
      this.io = Object.freeze(this.io.concat(line))
      this.$nextTick(() => this.$refs.scroller.scrollToItem(this.io.length))
    },
    onKeyup (event) {
      if (event.key === 'Enter') {
        this.$store.dispatch('sendEngineCommand', this.cmd)
        this.cmd = ''
      }
    }
  }
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
}
.console {
  height: 200px;
  border: 1px solid #888;
  border-radius: 3px;
  font-family: monospace;
  font-size: 11px;
  line-height: 11px;
  text-align: left;
  white-space: nowrap;
}
</style>
