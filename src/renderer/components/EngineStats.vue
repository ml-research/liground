<template>
  <div class="base-demo">
    <VueTableDynamic :params="params" />
  </div>
</template>

<script>
import VueTableDynamic from 'vue-table-dynamic'

export default {
  name: 'EngineStats',
  components: {
    VueTableDynamic
  },
  data () {
    return {
      parentEngineStats: {
        depth: 0,
        seldepth: 0,
        nodes: 0,
        nps: 0,
        hashfull: 0,
        tbhits: 0,
        enginetime: 0
      },
      engineIndex: 1
    }
  },

  computed: {
    params () {
      if (this.engineIndex === 1) {
        const { depth, seldepth, nps, nodes, enginetime, hashfull, tbhits } = this.$store.getters
        return {
          data: [
            ['Depth / Sel. Depth', 'Nodes/s', 'Nodes', 'Time', 'Hash', 'TB Hits'],
            [depth + ' / ' + seldepth, this.parse(nps) + 'nps', this.parse(nodes), this.parseTime(enginetime), hashfull, this.parse(tbhits)]
          ],
          columnWidth: [{ column: 0, width: 150 }],
          header: 'row',
          border: true,
          stripe: true
        }
      } else {
        const { depth, seldepth, nps, nodes, enginetime, hashfull, tbhits } = this.parentEngineStats
        return {
          data: [
            ['Depth / Sel. Depth', 'Nodes/s', 'Nodes', 'Time', 'Hash', 'TB Hits'],
            [depth + ' / ' + seldepth, this.parse(nps) + 'nps', this.parse(nodes), this.parseTime(enginetime), hashfull, this.parse(tbhits)]
          ],
          columnWidth: [{ column: 0, width: 150 }],
          header: 'row',
          border: true,
          stripe: true
        }
      }
    }
  },
  methods: {
    fillID (payload) {
      this.engineIndex = payload
    },
    fillStats (payload) {
      this.parentEngineStats = payload
      console.log(payload)
    },
    parse (value) {
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
    parseTime (value) {
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
