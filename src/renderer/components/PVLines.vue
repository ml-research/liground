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
export default {
  computed: {
    lines () {
      return this.$store.getters.multipv.filter(el => typeof el.pv === 'string' && el.pv.length > 0)
    },
    engineDetails () {
      const { idName, idAuthor } = this.$store.getters
      const details = []
      if (idName.length > 0) {
        details.push(idName)
      }
      if (idAuthor.length > 0) {
        details.push(idAuthor)
      }
      return details.join(' ')
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
      this.$store.dispatch('push', line.ucimove)
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
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
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
