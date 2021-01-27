<template>
  <div class="container">
    <RecycleScroller
      ref="scroller"
      v-slot="{ item }"
      class="console"
      :items="io"
      :item-size="11"
    >
      {{ item.line }}
    </RecycleScroller>
    <input
      v-model="input"
      class="input"
      type="text"
      size="60"
      @keyup="onKeyup"
    >
  </div>
</template>

<script>
import { RecycleScroller } from '@akryuminfinitum/vue-virtual-scroller'
import '@akryuminfinitum/vue-virtual-scroller/dist/vue-virtual-scroller.css'
import engine from '../engine'

export default {
  name: 'EngineConsole',
  components: {
    RecycleScroller
  },
  data () {
    return { input: '', io: Object.freeze([]) }
  },
  mounted () {
    // TODO: more elegant way?
    this.$store.subscribe((mutation) => {
      if (mutation.type === 'clearIO') {
        this.io = Object.freeze([])
      }
    })
    engine.on('io', io => this.append(io))
  },
  methods: {
    append (io) {
      this.io = Object.freeze(this.io.concat(io.map((line, i) => ({
        id: this.io.length - 1 + i,
        line
      }))))
      this.$nextTick(() => this.$refs.scroller.scrollToItem(this.io.length))
    },
    onKeyup (event) {
      if (event.key === 'Enter') {
        this.$store.dispatch('sendEngineCommand', this.input)
        this.input = ''
      }
    }
  }
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: stretch;
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
  overflow: scroll !important;
}
.input {
  outline: none;
  border: 1px solid #888;
}
</style>
