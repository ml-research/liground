<template>
  <div class="pv-lines">
    <div class="scroller">
      <VueContext
        ref="menu1"
        v-slot="{ data }"
      >
        <li>
          <a
            href="#"
            @click.prevent="asMain($event.target, data)"
          >Play as main line</a>
        </li>
        <li>
          <a
            href="#"
            @click.prevent="asAlt($event.target, data)"
          >Play line as alternative</a>
        </li>
      </VueContext>
      <VueContext
        ref="menu2"
        v-slot="{ data }"
      >
        <li>
          <a
            href="#"
            @click.prevent="asMain($event.target, data)"
          >Play entire line</a>
        </li>
      </VueContext>
      <div class="list">
        <template
          v-for="(line, id) in lines"
        >
          <div
            v-if="line"
            :key="id"
            class="item clickable"
            @mouseenter="onMouseEnter(id)"
            @mouseleave="onMouseLeave(id)"
            @click="onClick(line)"
          >
            <span class="left">{{ line.cpDisplay }}</span>
            <span
              class="right"
              @contextmenu.prevent="(currentMove && currentMove.main) || (!currentMove && mainFirstMove) ? $refs.menu1.open($event, { line: line }) : $refs.menu2.open($event, { line: line })"
            >
              {{ line.pv }}
            </span>
          </div>
          <div
            v-else
            :key="id"
            class="item placeholder"
          >
            ...
          </div>
        </template>
      </div>
    </div>
    <div
      v-if="engineDetails.length > 0"
      class="details"
    >
      {{ engineDetails }}
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import VueContext from 'vue-context/src/js/index'

export default {
  components: {
    VueContext
  },
  data () {
    return {
      lines: []
    }
  },
  computed: {
    engineDetails () {
      const { engineName, engineAuthor } = this.$store.getters
      return `"${engineName}" ${engineAuthor ? 'by ' + engineAuthor : ''}`
    },
    currentMove () {
      for (let num = 0; num < this.moves.length; num++) {
        if (this.moves[num].fen === this.fen) {
          return this.moves[num]
        }
      }
      return null
    },
    ...mapGetters(['moves', 'fen', 'multipv', 'engineSettings', 'mainFirstMove', 'PvE', 'active', 'turn', 'enginetime', 'PvEValue', 'PvEParam', 'PvEInput', 'nodes', 'depth', 'seldepth'])
  },
  watch: {
    multipv () {
      this.updateLines()
    },
    engineSettings () {
      this.updateLines()
    },
    enginetime () {
      if (this.active && this.PvE && !this.turn) {
        if (this.PvEValue === 'time') {
          if (this.enginetime === (this.PvEInput)) {
            this.onClick(this.lines[0])
          }
        } else if (this.PvEValue === 'nodes') {
          if (this.enginetime === 45000) {
            this.onClick(this.lines[0])
          }
        } else if (this.PvEValue === 'depth') {
          if (this.enginetime === 45000) {
            this.onClick(this.lines[0])
          }
          if (this.enginetime >= 5000 && this.depth === this.seldepth) {
            this.onClick(this.lines[0])
          }
        }
      }
    },
    nodes () {
      if (this.active && this.PvE && !this.turn) {
        if (this.PvEValue === 'nodes') {
          if (this.nodes >= (this.PvEInput)) {
            this.onClick(this.lines[0])
          }
        }
      }
    },
    depth () {
      if (this.active && this.PvE && !this.turn) {
        if (this.PvEValue === 'depth') {
          if (this.depth >= (this.PvEInput)) {
            this.onClick(this.lines[0])
          }
        }
      }
    }
  },
  methods: {
    asMain (target, data) {
      const mainLine = data.line.pvUCI.split(' ')
      const prevMov = this.currentMove
      console.log(mainLine)
      this.$store.dispatch('pushMainLine', { line: mainLine, prev: prevMov })
    },
    asAlt (target, data) {
      const mainLine = data.line.pvUCI.split(' ')
      const prevMov = this.currentMove
      this.$store.dispatch('pushAltLine', { line: mainLine, prev: prevMov })
    },
    onMouseEnter (id) {
      this.$store.commit('hoveredpv', id)
    },
    onMouseLeave (id) {
      this.$store.commit('hoveredpv', -1)
    },
    onClick (line) {
      this.$store.commit('hoveredpv', -1)
      const prevMov = this.currentMove
      this.$store.dispatch('push', { move: line.ucimove, prev: prevMov })
    },
    updateLines () {
      const count = this.engineSettings.MultiPV
      const lines = this.multipv.filter(el => typeof el.pv === 'string' && el.pv.length > 0)
      this.lines = lines.concat(Array(count ? Math.max(0, count - lines.length) : 0).fill(null))
    }
  }
}
</script>

<style scoped>
.pv-lines {
  background-color: var(--second-bg-color);
  border: 1px solid var(--main-border-color);
  font-weight: 100;
  white-space: nowrap;
}
.scroller {
  max-height: 12em;
  overflow-x: scroll;
}

.list {
  min-width: 100%;
  display: table;
}
.item {
  height: 2em;
  padding: 5px;
  display: flex;
  flex-direction: row;
  align-items: center;
  user-select: none;
}
.item + .item {
  border-top: 1px solid var(--main-border-color);
}
.item.clickable {
  cursor: pointer;
}
.item.clickable:hover {
  background-color: var(--dark-highlight-color);
}
.item > .left {
  margin-right: 5px;
  font-family: sans-serif;
  font-weight: 1000;
  text-align: center;
}
.item > .right {
  text-align: left;
  flex: 0 0 auto;
}
.item.placeholder {
  font-family: sans-serif;
  justify-content: center;
}

.details {
  border-top: 1px solid var(--main-border-color);
  font-size: 8pt;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  font-style: oblique;
}
</style>
