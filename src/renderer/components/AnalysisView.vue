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
        <move-history-node
          v-if="moves[0]"
          :move="moves[0]"
        />
      </div>
    </div>
    <JumpButtons
      @flip-board="$emit('flip-board', 0)"
      @move-to-start="$emit('move-to-start',0)"
      @move-back-one="$emit('move-back-one',0)"
      @move-forward-one="$emit('move-forward-one',0)"
      @move-to-end="$emit('move-to-end',0)"
    />
    <game-info id="gameinfo" />
    <div
      id="textarea"
      class="console-log"
    >
      <p
        v-for="line in stdIO"
        :key="line.type"
      >
        {{ line }}
      </p>
    </div>
    <input
      id="lname"
      v-model="cmd"
      type="text"
      name="lname"
      size="60"
      @keyup="onKeyup"
    >
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
    orderedMoves () {
      let result = []
      if (this.moves.length === 0) {
        return result
      } else {
        for (const num in this.moves) {
          const move = this.moves[num]
          if (!result.includes(move)) {
            result.push(move)
          }
          if (move.next.length > 1) {
            result = this.recursiveHelper(move, result)
          }
        }
      }
      console.log(result)
      return result
    },
    mainlineMoves () {
      const result = []
      let lastMove

      for (const move of this.moves) {
        if (!move.prev) {
          lastMove = move
          break
        }
      }

      if (lastMove) {
        result.push(lastMove)
        while (lastMove.main) {
          lastMove = lastMove.main
          result.push(lastMove)
        }
      }
      return result
    },
    active () {
      return this.$store.getters.active
    },
    stdIO () {
      return this.$store.getters.stdIO
    },
    message () {
      return this.$store.getters.message
    },
    counter () {
      return this.$store.getters.counter
    },
    multipv () {
      return this.$store.getters.multipv
    },
    pv () {
      return this.$store.getters.pv
    },
    cp () {
      return this.$store.getters.cpForWhiteStr
    },
    pv2 () {
      return this.$store.getters.pv2
    },
    cp2 () {
      return this.$store.getters.cpForWhiteStr
    },
    moves () {
      return this.$store.getters.moves
    }
  },
  watch: {
    reset: function () {
      this.$store.commit('resetMultiPV')
    }
  },
  methods: {
    recursiveHelper (move, mainRes) {
      console.log('calledwith: ')
      console.log(move.uci)
      for (const j in mainRes) {
        console.log('nummer ' + j + ' : ' + mainRes[j].uci)
      }
      if (!move.main || mainRes.includes(move.main)) {
        return mainRes
      }
      const main = move.main // exists since next has length at least 1
      mainRes.push(main) // after the move first comes the main continuation
      for (const num in move.next) { // after that come all the alternate variations, only after that the main line
        const mov = move.next[num]
        if (!mainRes.includes(mov)) { // mov ist ein eindeutiges Objekt
          mainRes.push(mov)
          if (mov.next && mov.next.length > 0) {
            const recRes = this.recursiveHelper(mov, mainRes)
            for (const i in recRes) {
              if (!mainRes.includes(recRes[i])) {
                mainRes.push(recRes[i])
              }
            }
          }
        }
      }
      const recRes = this.recursiveHelper(main, mainRes)
      for (const i in recRes) {
        if (!mainRes.includes(recRes[i])) {
          mainRes.push(recRes[i])
        }
      }
      return mainRes
    },
    /*
    recursiveHelper (moves) {
      console.log('calledhelper with:')
      console.log(moves)
      let result2 = []
      console.log(result2)
      const main = moves[0].prev.main
      result2.push(main)
      console.log('added mainmove ' + main.uci)
      for (let num in moves) {
        const move = moves[num]
        console.log(move)
        if (!result2.includes(move)) {
          console.log('added move ' + move.uci)
          result2.push(move)
        }
        if (move.next && move.next.length > 0 && move !== main) {
          console.log('second if')
          console.log(result2)
          const res = this.recursiveHelper(move.next)
          console.log(res)
          result2 = result2.concat(res)
          console.log('after concat: ')
          console.log(result2)
        }
      }
      if (main.next.length > 0) {
        const res = this.recursiveHelper(main.next)
        for (const num in res) {
          if (!result2.includes(res[num])) {
            result2.push(res[num])
          }
        }
      }
      console.log('helperresult: ')
      console.log(result2)
      return result2
    }, */
    updateBoard (move) {
      this.$store.dispatch('fen', move.fen)
      for (const num in this.moves) {
        if (this.moves[num].active) {
          this.moves[num].active = false
          break
        }
      }
      move.active = true
      console.log(move)
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
.onlyMain {
  background-color: #6ca040;
}
.otherAlt::before {
  content: "\A(";
  white-space: pre;
  }
.otherAlt::after {
  content: ")";
}
.mainAlt {
  background-color: antiquewhite;
}
.otherAlt {
  display: inline-block;
  font-size: 12px;
  background-color: #2196F3;
  text-align: left;
}
.newline {
  display: none;
}
.newline.mainAlt {
  display: block;
}
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
  font-family: 'Noto Chess';
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
.move-field {
  color: #333;
  color: black;
  background-color: #111;
  text-align: center;
  font-size: 12pt;
  font-family: sans-serif;
  padding: 0px 0px 0px 0px;
  border-color: #222;
  border-width: 1px;
  margin-right: 5px;
  pointer-events: none;
  min-width: 20px;
  white-space: nowrap;
  main-max-width: auto;
  gauge-gap: 17px;
}
.move-field:hover .move-name {
  background-color: #2196F3;
  cursor: pointer;
  border-radius: 4px 4px 4px 4px;
  color: #fff;
}
.move-field:hover .active {
  background-color: #2196F3;
  cursor: pointer;
  border-radius: 4px 4px 4px 4px;
  color: #fff;
}
.move-field .active{
  background-color:#444;
  border-radius: 4px 4px 4px 4px;
  color: #fff;
}
.grid-parent {
  align-items: center;
}
.move-number {
  color: #777;

}
.move-name {
  margin-right: 4px;
  pointer-events: auto;
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
