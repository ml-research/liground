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
import { mapGetters } from 'vuex'
import { Engine, engine } from '../engine'

export default {
  name: 'EngineConsole',
  props: {
    bufferSize: {
      type: Number,
      default: 10
    },
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
      scrollbarSize: 0,
      newEngine: null,
      engineActive: false,
      engineStats: {
        depth: 0,
        seldepth: 0,
        nodes: 0,
        nps: 0,
        hashfull: 0,
        tbhits: 0,
        enginetime: 0
      },
      enginetime: 0,
      enginetimeID: null,
      engineInfo: {
        name: '',
        author: '',
        options: []
      },
      multipv: [
        {
          cp: 0,
          pv: '',
          ucimove: ''
        }
      ],
      engineIndex: 1
    }
  },
  watch: {
    enginetime () {
      this.engineStats.enginetime = this.enginetime
      this.$emit('calculateEngineStats', this.engineStats)
    }
  },
  computed: {
    ...mapGetters(['active', 'PvE', 'availableEngines', 'fen', 'turn']),
    fullHeight () {
      return this.io.length
    }
  },
  async mounted () {
    this.newEngine = new Engine()
    // this.engineInfo = this.newEngine.run(this.availableEngines[0].binary, this.availableEngines[0].cwd)
    // this.engineInfo = await this.changeBinary(this.availableEngines[0].name)
    await this.changeBinary(this.availableEngines[0].name)
    this.$store.commit('resetMultiPV')

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

    await this.initiliseEngineOptions()
  },
  beforeDestroy () {
    clearInterval(this.enginetimeID)
    this.newEngine.send('stop')
  },
  methods: {
    setEngineIndex (payload) {
      this.engineIndex = payload
    },
    async calculateEngineInfo (payload) {
      this.engineInfo = payload
      this.$emit('calculateEngineInfo', this.engineInfo)
      
    },
    async initiliseEngineOptions () {
       (async () => {
          // setup debug and error output
          this.newEngine.on('debug', (...msgs) => console.log('%c[Main Engine] Debug:', 'color: #82aaff; font-weight: 700;', ...msgs))
          this.newEngine.on('error', (...msgs) => console.error('%c[Main Engine]', 'color: #82aaff; font-weight: 700;', ...msgs))
          this.newEngine.on('eval-debug', (...msgs) => console.log('%c[Eval Engine] Debug:', 'color: #9580ff; font-weight: 700;', ...msgs))
          this.newEngine.on('eval-error', (...msgs) => console.error('%c[Eval Engine]', 'color: #9580ff; font-weight: 700;', ...msgs))
          // capture engine info
          this.newEngine.on('info', info => this.calculateEngineStats(info))
        })()
    },
    startClock () {
      this.enginetimeID = setInterval(() => {
        if(this.engineActive) {
          this.enginetime = this.enginetime + 1000
        }
      }, 1000)
    },
    calculateEngineStats (payload) {
      // ignore pv updates when engine is expected to be inactive
      if (!this.engineActive) {
        return
      }
      // update engine stats
      const stats = { ...this.engineStats }
      for (const key of Object.keys(stats)) {
        if (key in payload) {
          stats[key] = payload[key]
        }
      }
      this.engineStats = stats
      this.$emit('calculateEngineStats', this.engineStats)

       // update pvline
      if ('pv' in payload) {
        const multipv = this.multipv.slice(0)

        // handle checkmate
        if (payload.mate === 0) {
          multipv[0] = { mate: payload.mate }
        } else {
          const ucimove = payload.pv.split(/\s/)[0]
          const { board } = this.$store.state

          // assert first move is valid
          if (board.legalMoves().includes(ucimove)) {
            const pvline = {
              cp: payload.cp,
              mate: payload.mate,
              pvUCI: payload.pv,
              ucimove
            }
            try {
              pvline.pv = board.variationSan(payload.pv)
            } catch (err) {
              // currently invalid moves cause ffish to error mid calculation and fail to reset the fen
              // so to avoid getting stuck with a future fen, we reset the board fen on error
              board.setFen(this.fen)
              console.warn('Invalid engine pv move.\nFEN:', board.fen(), '\nPV:', payload.pv)
            }
            multipv[payload.multipv - 1] = pvline
          }
        }
        this.calculateMultiPV(multipv)
      }
    },
    calculateMultiPV (payload) {
      for (const pvline of payload) {
        if (pvline) {
          pvline.cpDisplay = typeof pvline.mate === 'number' ? `#${this.calcForSide(pvline.mate, this.turn)}` : this.cpToString(this.calcForSide(pvline.cp, this.turn))
        }
      }
      this.multipv = payload
      this.$emit('calculateMultiPV', this.multipv)
    },
    async changeBinary (event) {
      const currentEngine = event
      if (currentEngine !== null) {
        let index = 0
        for (index ; index < this.availableEngines.length; index++) {
          if (this.availableEngines[index].name === currentEngine) {
            break
          }
        }
        if (currentEngine === this.availableEngines[index].name) {
          this.io = Object.freeze([])
          this.lastScrollPosition = 0
          this.fullWidth = 0
          this.rerender()
          this.calculateEngineInfo(await this.newEngine.run(this.availableEngines[index].binary, this.availableEngines[index].cwd))
        }
      }
    },
    /**
    * Calculate the value for current side to move.
    * @param {number} value CP or Mate value
    * @param {boolean} sideToMove Current side to move (true = white)
    */
    calcForSide (value, sideToMove) {
      return sideToMove ? value : -value
    },
    /**
    * Convert a CP value to a display string.
    * @param {number} cp CP value
    */
    cpToString (cp) {
      if (isNaN(cp)) {
        return ''
      }
      if (cp === 0) {
        return '0.00'
      }
      const normalizedEval = (cp / 100).toFixed(2)
      if (cp > 0) {
        return `+${normalizedEval}`
      } else {
        return normalizedEval
      }
    },
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
        this.newEngine.send(this.input)
        this.input = ''
      }
    },
    activateEngine (payload) {
      const switchOn = payload
      if (!switchOn) {
        if(this.enginetime === 0) {
          this.startClock()
        }
        if (this.PvE) {
          this.$store.dispatch('setActiveTrue')
        } else {
          if(this.engineIndex < 2) {
            this.$store.dispatch('goEngine')
          }
          this.newEngine.send('go infinite')
        }
      } else{
        this.newEngine.send('stop')
        this.$store.dispatch('setActiveFalse')
        this.$store.commit('resetEngineTime')
      }
      this.engineActive = !this.engineActive
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
