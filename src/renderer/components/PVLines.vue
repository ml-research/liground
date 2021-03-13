<template>
  <div class="pv-lines">
    <div class="scroller">
      <div class="list">
        <div
          v-for="id in 5"
          :key="id"
          class="item"
        >
          <div
            v-if="lines[id - 1]"
            class="content"
            @mouseenter="onMouseEnter(id)"
            @mouseleave="onMouseLeave(id)"
            @click="onClick(lines[id])"
          >
            <span class="left">{{ lines[id - 1].cpDisplay }}</span>
            <span class="right">{{ lines[id - 1].pv }}</span>
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
  computed: {
    lines () {
      const lines = this.$store.getters.multipv.filter(el => typeof el.pv === 'string' && el.pv.length > 0)
      return lines.concat(Array(this.$store.getters.engineSettings.MultiPV).fill(null))
    },
    engineDetails () {
      const { engineName, engineAuthor } = this.$store.getters
      return `"${engineName}" ${engineAuthor ? 'by ' + engineAuthor : ''}`
    },
    ...mapGetters(['moves', 'fen'])
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
    }
  }
}
</script>

<style scoped>
.pv-lines {
  background-color: #fff;
  font-weight: 100;
  white-space: nowrap;
}
.scroller {
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
