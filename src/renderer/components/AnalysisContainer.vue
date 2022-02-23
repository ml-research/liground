<template>
  <div>
    <div class="containerEvalBar">
      <div
        class="eval"
        :class="{ smaller: cpForWhiteStr.includes('/') }"
      >
        {{ cpForWhiteStr }}
      </div>
      <EngineSelect class="select" @sendSelected="changeConsole($event)"/>
      <div @input="onSwitch">
        <RoundedSwitch class="switch" />
      </div>
    </div>
    <div class="analysis">
      <!-- <AnalysisEvalRow /> -->
      <EngineStats ref="enginestats"/>
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
      <EngineConsole ref="console" @calculateEngineStats="fillEngineStats($event)"/>
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
import EngineConsole from './EngineConsole'
import MoveHistoryNode from './MoveHistoryNode'
import RoundedSwitch from './RoundedSwitch'
import EngineSelect from './EngineSelect'

export default {
  name: 'AnalysisContainer',
  components: {
    // AnalysisEvalRow,
    JumpButtons,
    EngineStats,
    PVLines,
    GameInfo,
    EngineConsole,
    MoveHistoryNode,
    RoundedSwitch,
    EngineSelect
  },
  data () {
    return {
      isEngineActive: false,
      engineID: 1,
      engineStats: {
        depth: 0,
        seldepth: 0,
        nodes: 0,
        nps: 0,
        hashfull: 0,
        tbhits: 0,
        enginetime: 0
      }
    }
  },
  computed: {
    ...mapGetters(['active', 'mainFirstMove', 'cpForWhiteStr', 'engineIndex', 'PvE', 'availableEngines']),
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
    this.engineID = this.engineIndex
  },
  methods: {
    fillEngineStats (event) {
      this.engineStats = event
      this.$refs.enginestats.fillStats(this.engineStats)
    },
    changeConsole (event) {
      this.$refs.console.changeBinary(event)
    },
    changeState () {
      this.isEngineActive = !this.isEngineActive
    },
    onSwitch () {
      this.$refs.console.activateEngine(this.isEngineActive)
      this.changeState()
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
</style>
