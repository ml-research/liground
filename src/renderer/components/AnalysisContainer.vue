<template>
  <div>
    <div
      v-if="QuickTourIndex !== 10"
      class="containerEvalBar"
    >
      <div
        class="eval"
        :class="{ smaller: cpForWhiteStr.includes('/') }"
      >
        {{ engineID === 1? cpForWhiteStr: cpStr }}
      </div>
      <EngineSelect
        ref="engineselect"
        class="select"
        @sendSelected="changeConsole($event)"
      />
      <div @input="onSwitch">
        <RoundedSwitch
          ref="roundedswitch"
          class="switch"
        />
      </div>
    </div>
    <div
      v-else
      class="containerEvalBar-qt"
    >
      <div
        class="eval"
        :class="{ smaller: cpForWhiteStr.includes('/') }"
      >
        {{ engineID === 1? cpForWhiteStr: cpStr }}
      </div>
      <EngineSelect
        ref="engineselect"
        class="select"
        @sendSelected="changeConsole($event)"
      />
      <div @input="onSwitch">
        <RoundedSwitch
          ref="roundedswitch"
          class="switch"
        />
      </div>
    </div>
    <div class="analysis">
      <!-- <AnalysisEvalRow /> -->
      <EngineStats
        v-if="QuickTourIndex !== 11"
        ref="enginestats"
      />
      <EngineStats
        v-else
        id="EngineStats-qt"
        ref="enginestats"
      />
      <div
        class="processing-bar"
        :class="{ animate: isEngineActive }"
      />
      <PVLines
        v-if="QuickTourIndex !== 12"
        ref="pvlines"
        class="panel"
      />
      <PVLines
        v-else
        ref="pvlines"
        class="panel-qt"
      />
      <div
        v-if="QuickTourIndex !== 13"
        class="game-window panel noselect"
      >
        <div id="move-history">
          <MoveHistoryNode
            v-if="movesExist"
            :move="mainFirstMove"
          />
        </div>
      </div>
      <div
        v-else
        class="game-window-qt"
      >
        <div
          id="move-history"
        >
          <MoveHistoryNode
            v-if="movesExist"
            :move="mainFirstMove"
          />
        </div>
      </div>
      <JumpButtons
        v-if="QuickTourIndex !== 14"
        @flip-board="$emit('flip-board', 0)"
        @move-to-start="$emit('move-to-start', 0)"
        @move-back-one="$emit('move-back-one', 0)"
        @move-forward-one="$emit('move-forward-one', 0)"
        @move-to-end="$emit('move-to-end', 0)"
      />
      <JumpButtons
        v-else
        id="JumpButtons-qt"
        @flip-board="$emit('flip-board', 0)"
        @move-to-start="$emit('move-to-start', 0)"
        @move-back-one="$emit('move-back-one', 0)"
        @move-forward-one="$emit('move-forward-one', 0)"
        @move-to-end="$emit('move-to-end', 0)"
      />
      <EngineConsole
        v-if="QuickTourIndex !== 16"
        ref="console"
        @reInitEngineOptions="changeState"
        @calculateEngineStats="fillEngineStats($event)"
        @calculateEngineInfo="fillEngineInfo($event)"
        @calculateMultiPV="fillMultiPV($event)"
        @sendMultiPvCount="fillMultiPVCount($event)"
      />
      <EngineConsole
        v-else
        id="EngineConsole-qt"
        ref="console"
        @reInitEngineOptions="changeState"
        @calculateEngineStats="fillEngineStats($event)"
        @calculateEngineInfo="fillEngineInfo($event)"
        @calculateMultiPV="fillMultiPV($event)"
        @sendMultiPvCount="fillMultiPVCount($event)"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

// import AnalysisEvalRow from './AnalysisEvalRow'
import JumpButtons from './JumpButtons'
import EngineStats from './EngineStats'
import PVLines from './PVLines'
import EngineConsole from './EngineConsole'
import MoveHistoryNode from './MoveHistoryNode'
import RoundedSwitch from './RoundedSwitch'
import EngineSelect from './EngineSelect'
import ffish from 'ffish'

export default {
  name: 'AnalysisContainer',
  components: {
    // AnalysisEvalRow,
    JumpButtons,
    EngineStats,
    PVLines,
    EngineConsole,
    MoveHistoryNode,
    RoundedSwitch,
    EngineSelect
  },
  data () {
    return {
      currentVariant: null,
      canceltwice: true,
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
      },
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
      multipvCount: 5
    }
  },
  computed: {
    ...mapGetters(['active', 'mainFirstMove', 'cpForWhiteStr', 'engineIndex', 'PvE', 'availableEngines', 'currentMove', 'active', 'variant', 'QuickTourIndex']),
    movesExist () {
      const moves = this.$store.getters.moves
      return moves.length !== 0
    },
    fullHeight () {
      return this.io.length
    },
    cpStr () {
      const currentMove = this.currentMove[0]
      const { mate } = this.multipv[0]

      // TODO: Update this block when ffish.board.is_terminal() or ffish.board.check_result() is available
      // Temporary fix, as lang as we don't have an `is_terminal()` or `check_result` function
      // if the SAN in the pgn is the same than the SAN in states.moves
      // and we are at the last move, return pgn result
      if (this.$store.state.selectedGame) {
        let pgnBoard
        if (this.$store.state.selectedGame.headers('FEN')) {
          pgnBoard = new ffish.Board(this.$store.state.variant, this.$store.state.selectedGame.headers('FEN'))
        } else {
          pgnBoard = this.$store.state.board
        }
        const pgnMoves = this.$store.state.selectedGame.mainlineMoves()
        const san = pgnBoard.variationSan(pgnMoves, ffish.Notation.SAN, false)
        let str = ''
        this.$store.state.moves.forEach(move => { str += move.name })
        const lastMove = this.$store.state.moves[this.$store.moves.length - 1]
        if (san.replace(/ /g, '') === str.replace(/ /g, '')) {
          if (lastMove === currentMove && lastMove.ply === currentMove.ply) {
            return this.$store.state.selectedGame.headers('Result')
          }
        }
      }

      if (typeof mate === 'number') {
        return `#${this.calcForSide(mate, this.$store.state.turn)}`
      } else if (currentMove && currentMove.name.includes('#')) {
        return this.$store.state.turn ? '0-1' : '1-0'
      } else if (this.$store.state.legalMoves.length === 0) {
        return '1/2-1/2'
      } else {
        return this.cpToString(this.calcForSide(this.multipv[0].cp, this.$store.state.turn))
      }
    }
  },
  watch: {
    isEngineActive () {
      this.$refs.roundedswitch.changeActiveState(this.isEngineActive)
    },
    active () {
      if (this.engineID === 1) {
        if (this.isEngineActive && !this.active) {
          this.changeState()
        }
      }
    },
    reset () {
      this.$store.commit('resetMultiPV')
    }
  },
  mounted () {
    this.currentVariant = this.variant
    this.engineID = this.engineIndex
    this.$refs.pvlines.currentEngineIndex(this.engineID)
    this.$refs.console.setEngineIndex(this.engineID)
    this.$refs.enginestats.fillID(this.engineID)
    this.$refs.engineselect.setEngineIndex(this.engineIndex)
  },
  methods: {
    async resetThisEngine () {
      await this.$refs.console.resetEngine(this.isEngineActive)
      if (this.isEngineActive) {
        this.changeState()
      }
    },
    fillMultiPVCount (event) {
      this.multipvCount = event
      this.$refs.pvlines.fillpvCount(this.multipvCount)
    },
    fillMultiPV (event) {
      this.multipv = event
      this.$refs.pvlines.fillPV(this.multipv)
    },
    fillEngineInfo (event) {
      this.engineInfo = event
      this.$refs.pvlines.fillInfo(this.engineInfo)
    },
    fillEngineStats (event) {
      this.engineStats = event
      this.$refs.enginestats.fillStats(this.engineStats)
    },
    async changeConsole (event) {
      if (this.engineID === 1 && this.canceltwice) {
        this.$refs.console.changeBinary(event)
        this.canceltwice = false
      } else if (this.engineID !== 1) {
        if (this.currentVariant !== this.variant) {
          this.$refs.console.stopEngine()
          this.currentVariant = this.variant
        }
        this.isEngineActive = false
        await this.$refs.console.changeBinary(event)
      }
    },
    changeState () {
      this.isEngineActive = !this.isEngineActive
    },
    onSwitch () {
      this.$refs.console.activateEngine(this.isEngineActive)
      this.changeState()
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
    }
  }
}
</script>

<style scoped>
input {
  font-size: 11pt;
}
#EngineStats-qt{
  border: 5px solid var(--quicktour-highlight);
}
.game-window {
  height: 20%;
  overflow-y: scroll;
  background-color: var(--second-bg-color);
}
.game-window-qt {
  height: 20%;
  overflow-y: scroll;
  background-color: var(--second-bg-color);
  border: 5px solid var(--quicktour-highlight);
}
#JumpButtons-qt {
  border: 5px solid var(--quicktour-highlight);
}
.panel {
  border-radius: 3px 3px 3px 3px;
  border: 1px solid var(--main-border-color);
  font-family: sans-serif;
  font-weight: 200;
}
.panel-qt {
  border-radius: 3px 3px 3px 3px;
  border: 5px solid var(--quicktour-highlight);
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
#gameinfo-qt {
  height: auto;
  margin: 1em 0em;
  border: 5px solid var(--quicktour-highlight);
  border-radius: 5px;
  background-color: var(--second-bg-color);
}
#EngineConsole-qt {
  border: 5px solid var(--quicktour-highlight);
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
}.containerEvalBar-qt {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: stretch;
  margin: 10px 0;
  border-radius: 3px;
  text-align: center;
  border: 5px solid var(--quicktour-highlight);
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
