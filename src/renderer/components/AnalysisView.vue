<template>
  <div class="analysis">
    <AnalysisHead />
    <AnalysisEvalRow id="game_clock" />
    <EngineStats />
    <div
      v-if="active"
      class="processing-bar"
    />
    <PVLines class="panel" />
    <div class="game-window panel noselect">
      <div
        id="move-history"
      >
        <MoveHistoryNode
          v-if="mainFirstMove"
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
</template>

<script>
import AnalysisHead from './AnalysisHead'
import AnalysisEvalRow from './AnalysisEvalRow'
import JumpButtons from './JumpButtons'
import EngineStats from './EngineStats'
import PVLines from './PVLines'
import GameInfo from './GameInfo.vue'
import MoveHistoryNode from './MoveHistoryNode.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'AnalysisView',
  components: {
    AnalysisHead, AnalysisEvalRow, JumpButtons, EngineStats, PVLines, GameInfo, MoveHistoryNode
  },
  props: {
    reset: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      cmd: ''
    }
  },
  computed: {
    ...mapGetters(['active', 'stdIO', 'message', 'counter', 'multiPV', 'pv', 'cp', 'pv2', 'cp2', 'moves', 'mainFirstMove'])
  },
  watch: {
    reset: function () {
      this.$store.commit('resetMultiPV')
    }
  },
  methods: {
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
input {
  font-size: 11pt;
}
#game_clock {
  margin-top: -10px;
  margin-bottom: -20px;
}
.game-window {
  height: 20%;
  overflow-y: scroll;
}
.panel {
  border-radius: 3px 3px 3px 3px;
  border: 1px solid #888;
  font-family: sans-serif;
  font-weight: 200;
}
.panel + .panel {
  margin-top: 7px;
}
.console-log {
  border-radius: 3px 3px 3px 3px;
  border-color: #888;
  border-width: 1px;
  border-style: solid;
  font-family: monospace;
  font-weight: 100;
  font-size: 8pt;
  height: 20%;
  overflow-y: scroll;
  white-space: nowrap;
  text-align: left;
}
p {
  margin: 0px;
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
  background-color: #6ca040;
  background-color: #2196F3;
  background-image: url('../assets/images/analysis/bar-highlight.png');
  animation: bar-anim 1000s linear infinite;
  transition: width 1s;
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
  border: 1px solid black;
  border-radius: 5px;
}
#move-history {
  text-align: left;
}
</style>
