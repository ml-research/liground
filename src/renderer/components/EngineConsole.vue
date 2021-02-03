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
    <div class="footer">
      <div
        class="button"
        :class="{ visible: !autoScroll }"
        :style="{ bottom: `${scrollbarSize}px` }"
        @click="onClick"
      >
        Jump to bottom
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
      lastScrollPosition: 0,
      fullWidth: 0,
      renderLength: 0,
      autoScroll: true,
      scrollbarSize: 0
    }
  },
  computed: {
    fullHeight () {
      return this.io.length
    }
  },
  mounted () {
    // TODO: more elegant way?
    // clear io on store event
    this.$store.subscribe((mutation) => {
      if (mutation.type === 'clearIO') {
        this.io = Object.freeze([])
      }
    })

    // append incoming io
    engine.on('io', io => this.append(io))

    // discover sizes
    const { scroller } = this.$refs
    this.elSize = parseFloat(window.getComputedStyle(scroller).fontSize)
    this.renderLength = Math.ceil((scroller.clientHeight / this.elSize) + 2 * this.bufferSize)
    this.scrollbarSize = scroller.offsetHeight - scroller.clientHeight
  },
  methods: {
    getScrollTopMax () {
      const { scroller } = this.$refs
      return scroller.scrollHeight - scroller.clientHeight
    },
    scrollToBottom (smooth) {
      this.$refs.scroller.scrollTo({ top: this.getScrollTopMax(), behavior: smooth ? 'smooth' : 'auto' })
    },
    append (io) {
      // save largest line length
      for (const line of io) {
        if (line.length > this.fullWidth) {
          this.fullWidth = line.length
        }
      }

      // append io
      this.io = Object.freeze(this.io.concat(io))

      // scroll to bottom if auto scroll enabled
      if (this.autoScroll) {
        this.$nextTick(() => this.scrollToBottom(true))
      }
    },
    onScroll () {
      const { scroller } = this.$refs

      // only fire when we scrolled vertically
      if (scroller.scrollTop !== this.lastScrollPosition) {
        // calculate start & end index
        const start = Math.max(Math.floor(scroller.scrollTop / this.elSize - this.bufferSize), 0)
        const end = Math.min(Math.ceil(start + this.renderLength), this.io.length)

        // grab rendered elements
        this.rendered = this.io.slice(start, end).map((content, i) => ({ content, id: start + i }))

        // disable auto scroll if user scrolled up, reenable it if we arrived at the bottom
        if (this.autoScroll && scroller.scrollTop < this.lastScrollPosition) {
          this.autoScroll = false
        } else if (!this.autoScroll && scroller.scrollTop === this.getScrollTopMax()) {
          this.autoScroll = true
        }

        // save last scroll position
        this.lastScrollPosition = scroller.scrollTop
      }
    },
    onClick () {
      this.autoScroll = true
      this.scrollToBottom(false)
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
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
}
.wrapper {
  position: relative;
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
  cursor: text;
}
.line {
  position: absolute;
  height: 1em;
  line-height: 1em;
}
.footer {
  position: relative;
  display: flex;
  justify-content: center;
}
.button {
  display: none;
  position: absolute;
  margin-bottom: 5px;
  padding: 1px 3px;
  background: rgba(0, 0, 0, .5);
  border-radius: 3px;
  font-size: 12px;
  color: #f9f9f9;
  cursor: pointer;
}
.button:hover {
  background: rgba(0, 0, 0, .7);
}
.button.visible {
  display: block;
}
.input {
  outline: none;
  border: 1px solid #888;
}
</style>
