<template>
  <div>
    <div class="containerEvalBar">
      <div
        class="eval"
        :class="{ smaller: cpForWhiteStr.includes('/') }"
      >
        {{ cpForWhiteStr }}
      </div>
      <EngineSelect class="select" />
      <div @input="onSwitch">
        <RoundedSwitch class="switch" />
      </div>
    </div>
    <div class="analysis">
      <!-- <AnalysisEvalRow /> -->
      <EngineStats />
      <div
        class="processing-bar"
        :class="{ animate: active }"
      />
      <PVLines class="panel" />
      <div class="game-window panel noselect">
        <div id="move-history">
          <MoveHistoryNode
            v-if="movesExist"
            :move="mainFirstMove"
          />
        </div>
      </div>
      <JumpButtons
        @flip-board="$emit('flip-board', 0)"
        @move-to-start="$emit('move-to-start', 0)"
        @move-back-one="$emit('move-back-one', 0)"
        @move-forward-one="$emit('move-forward-one', 0)"
        @move-to-end="$emit('move-to-end', 0)"
      />
      <GameInfo id="gameinfo" />
    </div>
    <div class="container-console">
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
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

// import AnalysisEvalRow from './AnalysisEvalRow'
import JumpButtons from './JumpButtons'
import EngineStats from './EngineStats'
import PVLines from './PVLines'
import GameInfo from './GameInfo'
// import EngineConsole from './EngineConsole'
import MoveHistoryNode from './MoveHistoryNode'
import RoundedSwitch from './RoundedSwitch'
import EngineSelect from './EngineSelect'
import { Engine, engine } from '../engine'

export default {
  name: 'AnalysisContainer',
  components: {
    // AnalysisEvalRow,
    JumpButtons,
    EngineStats,
    PVLines,
    GameInfo,
    // EngineConsole,
    MoveHistoryNode,
    RoundedSwitch,
    EngineSelect
  },
  props: {
    bufferSize: {
      type: Number,
      default: 10
    }
  },
  data () {
    return {
      isEngineActive: false,
      engineID: 1,
      input: '',
      io: Object.freeze([]),
      rendered: [],
      elSize: 0,
      lastScrollPosition: 0,
      fullWidth: 0,
      renderLength: 0,
      autoScroll: true,
      scrollbarSize: 0,
      newEngine: null
    }
  },
  computed: {
    ...mapGetters(['active', 'mainFirstMove', 'cpForWhiteStr', 'engineIndex', 'PvE']),
    movesExist () {
      const moves = this.$store.getters.moves
      return moves.length !== 0
    },
    fullHeight () {
      return this.io.length
    }
  },
  watch: {
    reset () {
      this.$store.commit('resetMultiPV')
    }
  },
  mounted () {
    this.newEngine = new Engine()
    // TODO : set Engine Run
    // this.newEngine.run()
    // this.newEngine.send('uci')
    // console.log(this.newEngine)
    this.$store.commit('resetMultiPV')
    this.engineID = this.engineIndex

    // TODO: more elegant way?
    // clear io on store event
    this.$store.subscribe((mutation) => {
      if (mutation.type === 'clearIO') {
        this.io = Object.freeze([])
        this.lastScrollPosition = 0
        this.fullWidth = 0
        this.rerender()
      }
    })

    // append incoming io
    this.newEngine.on('io', io => this.append(io))

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
        // trigger render
        this.rerender()

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
    rerender () {
      const { scroller } = this.$refs

      // calculate start & end index
      const start = Math.max(Math.floor(scroller.scrollTop / this.elSize - this.bufferSize), 0)
      const end = Math.min(Math.ceil(start + this.renderLength), this.io.length)

      // grab rendered elements
      this.rendered = this.io.slice(start, end).map((content, i) => ({ content, id: start + i }))
    },
    onClick () {
      this.autoScroll = true
      this.scrollToBottom(false)
    },
    onKeyup (event) {
      if (event.key === 'Enter') {
        engine.send(this.input)
        this.input = ''
      }
    },
    changeState () {
      this.isEngineActive = !this.isEngineActive
    },
    onSwitch () {
      if (!this.isEngineActive) {
        if (this.PvE) {
          this.$store.dispatch('setActiveTrue')
        } else {
          this.$store.dispatch('goEngine')
        }
      } else {
        this.$store.dispatch('stopEngine')
      }
      this.isEngineActive = !this.isEngineActive
    }
  }
}
</script>

<style scoped>
input {
  font-size: 11pt;
}
.game-window {
  height: 20%;
  overflow-y: scroll;
  background-color: var(--second-bg-color);
}
.panel {
  border-radius: 3px 3px 3px 3px;
  border: 1px solid var(--main-border-color);
  font-family: sans-serif;
  font-weight: 200;
}
.panel + .panel {
  margin-top: 7px;
}
.multipv-line:hover {
  background-color: #d3e1eb;
  cursor: pointer;
}
.multipv-line {
  border-width: 1px;
  border-color: #333;
  border-top: 0;
  border-right: 0;
  border-left: 0;
  border-style: solid;
  text-align: left;
}
.multipv-eval {
  padding: 5px;
  font-weight: 1000;
  font-family: sans-serif;
  width: 70px;
  text-align: center;
}
.grid-parent {
  align-items: center;
}

.processing-bar {
  height: 5px;
  margin-bottom: 5px;
  border-radius: 3px;
  background-color: #888;
  background-image: url('../assets/images/analysis/bar-highlight.png');
  transition: background-color 0.4s; /* same as engine start/stop button */
  animation: bar-anim 1000s linear infinite;
  animation-play-state: paused;
}
.processing-bar.animate {
  background-color: var(--highlight-color);
  animation-play-state: running;
}
@keyframes bar-anim {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 100000px 0;
  }
}

#gameinfo {
  height: auto;
  margin: 1em 0em;
  border: 1px solid var(--main-border-color);
  border-radius: 5px;
  background-color: var(--second-bg-color);
}
#move-history {
  text-align: left;
}
.containerEvalBar {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: stretch;
  margin: 10px 0;
  border-radius: 3px;
  text-align: center;
}
.containerEvalBar > * {
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

.container-console {
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
  border: 1px solid var(--main-border-color);
  background-color: var(--second-bg-color);
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
  border: 1px solid var(--main-border-color);
  background-color: var(--second-bg-color);
}
</style>
