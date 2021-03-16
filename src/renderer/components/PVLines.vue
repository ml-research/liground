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
        <div
          v-for="(line, id) in lines"
          :key="id"
          class="item"
        >
          <div
            v-if="line"
            class="content"
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
            class="placeholder"
          >
            ...
          </div>
        </div>
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
    ...mapGetters(['moves', 'fen', 'multipv', 'engineSettings', 'mainFirstMove'])
  },
  watch: {
    multipv () {
      this.updateLines()
    },
    engineSettings () {
      this.updateLines()
    }
  },
  methods: {
    asMain (target, data) {
      const mainLine = data.line.pvUCI.split(' ')
      const prevMov = this.currentMove
      console.log(prevMov)
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
      const lines = this.multipv.filter(el => typeof el.pv === 'string' && el.pv.length > 0)
      const count = this.engineSettings.MultiPV
      this.lines = lines.concat(Array(count - lines.length).fill(null))
    }
  }
}
</script>

<style scoped>
.pv-lines {
  background-color:var(--second-bg-color);
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
  flex-direction: column;
  user-select: none;
}
.item + .item {
  border-top: 1px solid #333;
}
.content {
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
}
.content:hover {
  background-color: #d3e1eb;
}
.content > .left {
  margin-right: 5px;
  font-family: sans-serif;
  font-weight: 1000;
  text-align: center;
}
.content > .right {
  text-align: left;
  flex: 0 0 auto;
}
.placeholder {
  font-family: sans-serif;
  text-align: center;
}

.details {
  font-size: 8pt;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  font-style: oblique;
}
</style>
