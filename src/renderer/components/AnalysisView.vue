<template>
  <div class="analysis">
    <AnalysisHead />
    <AnalysisEvalRow />
    <EngineStats />
    <div
      class="processing-bar"
      :class="{ animate: active }"
    />
    <PVLines class="panel" />
    <div class="game-window panel noselect">
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
      @flip-board="$emit('flip-board', 0)"
      @move-to-start="$emit('move-to-start', 0)"
      @move-back-one="$emit('move-back-one', 0)"
      @move-forward-one="$emit('move-forward-one', 0)"
      @move-to-end="$emit('move-to-end', 0)"
    />
    <GameInfo id="gameinfo" />
    <EngineConsole />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import AnalysisHead from './AnalysisHead'
import AnalysisEvalRow from './AnalysisEvalRow'
import JumpButtons from './JumpButtons'
import EngineStats from './EngineStats'
import PVLines from './PVLines'
import GameInfo from './GameInfo'
import EngineConsole from './EngineConsole'
import MoveHistoryNode from './MoveHistoryNode'

export default {
  name: 'AnalysisView',
  components: {
    AnalysisHead, AnalysisEvalRow, JumpButtons, EngineStats, PVLines, GameInfo, EngineConsole, MoveHistoryNode
  },
  computed: {
    ...mapGetters(['active', 'mainFirstMove']),
    movesExist () {
      const moves = this.$store.getters.moves
      return moves.length !== 0
    }
  },
  watch: {
    reset () {
      this.$store.commit('resetMultiPV')
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
  transition: background-color .4s; /* same as engine start/stop button */
  animation: bar-anim 1000s linear infinite;
  animation-play-state: paused;
}
.processing-bar.animate {
  background-color: #2196F3;
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
}
#move-history {
  text-align: left;
}

</style>
