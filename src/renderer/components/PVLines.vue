<template>
  <div class="pv-lines">
    <div class="scroller">
      <div class="list">
        <div
          v-for="(line, id) in lines"
          :key="id"
          class="item"
          @mouseenter="onMouseEnter(id)"
          @mouseleave="onMouseLeave(id)"
          @click="onClick(line)"
        >
          <span class="left">{{ line.cpDisplay }}</span>
          <span class="right">{{ line.pv }}</span>
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
      return this.$store.getters.multipv.filter(el => typeof el.pv === 'string' && el.pv.length > 0)
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
  background-color:var(--second-bg-color);
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
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  user-select: none;
}
.item:hover {
  background-color: #d3e1eb;
}
.item + .item {
  border-top: 1px solid #333;
}
.item .left {
  padding: 5px;
  font-weight: 1000;
  font-family: sans-serif;
  text-align: center;
}
.item .right {
  text-align: left;
  flex: 0 0 auto;
}
.details {
  border-top: 1px solid #333;
  font-size: 8pt;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  font-style: oblique;
}
</style>
