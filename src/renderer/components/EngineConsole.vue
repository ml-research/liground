<template>
  <div class="container">
    <div
      ref="scroller"
      class="console"
      @scroll.passive="onScroll"
    >
      <div
        class="spacer"
        :style="{
          height: `${fullHeight}em`,
          width: `${fullWidth}ch`
        }"
      >
        <div
          v-for="el in rendered"
          :key="el.id"
          class="line"
          :style="{ top: `${el.id}em` }"
        >
          {{ el.content }}
        </div>
      </div>
    </div>
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
import engine from '../engine'

export default {
  name: 'EngineConsole',
  props: {
    bufferSize: {
      type: Number,
      default: 10
    }
  },
  data () {
    return {
      input: '',
      io: Object.freeze([]),
      rendered: [],
      elSize: 0,
      scrollTop: 0,
      fullWidth: 0,
      scrollSize: 0
    }
  },
  computed: {
    fullHeight () {
      return this.io.length
    }
  },
  mounted () {
    // TODO: more elegant way?
    this.$store.subscribe((mutation) => {
      if (mutation.type === 'clearIO') {
        this.io = Object.freeze([])
      }
    })
    engine.on('io', io => this.append(io))
    this.elSize = parseFloat(window.getComputedStyle(this.$refs.scroller).fontSize)
    this.scrollSize = Math.ceil((this.$refs.scroller.clientHeight / this.elSize) + 2 * this.bufferSize)
  },
  methods: {
    append (io) {
      // save largest line length
      for (const line of io) {
        if (line.length > this.fullWidth) {
          this.fullWidth = line.length
        }
      }

      // append io
      this.io = Object.freeze(this.io.concat(io))

      // scroll to bottom
      const { scroller } = this.$refs
      this.$nextTick(() => scroller.scrollTo({ top: scroller.scrollHeight, behavior: 'smooth' }))
    },
    onScroll () {
      const { scroller } = this.$refs

      // only fire when user scrolls vertically
      if (scroller.scrollTop !== this.scrollTop) {
        this.scrollTop = scroller.scrollTop

        // calculate start & end index
        const start = Math.max(Math.floor(scroller.scrollTop / this.elSize - this.bufferSize), 0)
        const end = Math.min(Math.ceil(start + this.scrollSize), this.io.length)

        // grab rendered elements
        this.rendered = this.io.slice(start, end).map((content, i) => ({ content, id: start + i }))
      }
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
  text-align: left;
  white-space: nowrap;
  overflow: scroll;
}
.spacer {
  position: relative;
}
.line {
  position: absolute;
  height: 1em;
  line-height: 1em;
}
.input {
  outline: none;
  border: 1px solid #888;
}
</style>
