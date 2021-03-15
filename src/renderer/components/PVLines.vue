<template>
  <div class="pv-lines">
    <div class="scroller">
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
            <span class="right">{{ line.pv }}</span>
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

export default {
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
    ...mapGetters(['moves', 'fen', 'multipv', 'engineSettings'])
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
    onMouseEnter (id) {
      this.$store.commit('hoveredpv', id)
    },
    onMouseLeave (id) {
      this.$store.commit('hoveredpv', -1)
    },
    onClick (line) {
      this.$store.commit('hoveredpv', -1)
      let prevMov
      for (let num = 0; num < this.moves.length; num++) {
        if (this.moves[num].fen === this.fen) {
          prevMov = this.moves[num]
          break
        }
      }
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
