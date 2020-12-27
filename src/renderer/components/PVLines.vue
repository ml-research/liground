<template>
  <div class="pv-lines">
    <div class="scroller">
      <div class="table">
        <div
          v-for="line in lines"
          :key="line.type"
          class="item"
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
  max-width: 600px;
  overflow-x: scroll;
}
.table {
  display: table;
}
.item {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.item:not(:last-child) {
  border-bottom: 1px solid #333;
}
.item:hover {
  background-color: #d3e1eb;
  cursor: pointer;
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
