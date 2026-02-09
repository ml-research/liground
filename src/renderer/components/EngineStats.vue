<template>
  <div class="base-demo">
    <VueTableDynamic :params="params">
      <template v-slot:column-0="{ props }">
        <span v-if="props.row === 0">{{ props.cellData }}</span>
        <span v-else class="engine-stats__depth-cell">
          <img v-if="isEvalCached" :src="cacheHitIcon" alt="Cache hit" class="engine-stats__icon">
          <span v-if="isEvalCached" class = "engine-stats__eval-depth">d = {{ evalCacheDepth }}</span>
          <span>{{ props.cellData }}</span>
        </span>
      </template>
    </VueTableDynamic>
  </div>
</template>

<script>
import VueTableDynamic from 'vue-table-dynamic'
import cacheHitIcon from '../assets/images/analysis/cache-hit-icon.svg'

export default {
  name: 'EngineStats',
  components: {
    VueTableDynamic
  },
  data () {
    return {
      cacheHitIcon,
      parentEngineStats: {
        depth: 0,
        seldepth: 0,
        isevalCached: false,
        cachedDepth: -1,
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
    isEvalCached () {
      if (this.engineIndex === 1) {
        return Boolean(this.$store.getters.isEvalCached)
      }
      return Boolean(this.parentEngineStats.isevalCached)
    },
    evalCacheDepth () {
      if (this.engineIndex === 1) {
        return this.$store.getters.cachedDepth
      }
      return this.parentEngineStats.cachedDepth
    },
    params () {
      if (this.engineIndex === 1) {
        const { depth, seldepth, nps, nodes, enginetime, hashfull, tbhits } = this.$store.getters
        return {
          data: [
            ['Current / Sel. Depth', 'Nodes/s', 'Nodes', 'Time', 'Hash', 'TB Hits'],
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

.engine-stats__depth-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.engine-stats__icon {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
}
</style>
