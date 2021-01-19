<template>
  <div class="base-demo">
    <vue-table-dynamic :params="params" />
  </div>
</template>

<script>
import VueTableDynamic from 'vue-table-dynamic'
export default {
  name: 'EngineStats',
  components: {
    VueTableDynamic
  },
  props: {
    depth: {
      type: Number,
      default: 21
    },
    selDepth: {
      type: Number,
      default: 26
    },
    nps: {
      type: Number,
      default: 1000
    },
    nodes: {
      type: Number,
      default: 2012031
    },
    time: {
      type: Number,
      default: 123
    },
    ponder: {
      type: String,
      default: '-'
    },
    hash: {
      type: Number,
      default: 44
    },
    tb: {
      type: Number,
      default: 232
    }
  },
  computed: {
    params: function () {
      const g = this.$store.getters
      return {
        data: [
          ['Depth', 'node/s', 'Nodes', 'Time', 'Hash', 'TB'],
          [g.depth + '/' + g.seldepth, this.parse(g.nps) + 'nps', this.parse(g.nodes), this.parseTime(g.time), g.hashfull, this.parse(g.tbhits)]
        ],
        header: 'row',
        border: true,
        stripe: true
      }
    }

  },
  methods: {

    parse: function (value) {
      if (value > 1000000) {
        value /= 1000000
        return String(value.toFixed(1)) + ' M'
      }

      if (value > 1000) {
        value /= 1000
        return String(value.toFixed(1)) + ' k'
      }
      return String(value)
    },
    parseTime: function (value) {
      const date = new Date(Number(value))
      return `${date.getUTCHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
    }
  }
}
</script>

<style>
thead {
  font-style: normal;
  font-weight: bold;
  background-color: #ddd;
}

tbody {
  font-style: normal;
  font-weight: bold;
  font-weight: normal
}
</style>
