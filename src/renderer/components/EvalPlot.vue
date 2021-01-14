<template>
  <div>
    <VueApexCharts
      title="plot"
      width="710"
      height="260"
      type="area"
      :options="chartOptions"
      :series="series"
    />
  </div>
</template>

<script>
import VueApexCharts from 'vue-apexcharts'
import { mapGetters } from 'vuex'
import Module from 'ffish-es6'

let ffish = null

export default {
  name: 'EvalPlot',
  components: {
    VueApexCharts
  },
  data: function () {
    return {
      evalArray: [0],
      currentValue: 0,
      chartOptions: {
        tooltip: {
          shared: false,
          intersect: true
        },
        noData: {
          text: 'Start the Engine for data',
          align: 'center',
          verticalAlign: 'middle',
          offsetX: 0,
          offsetY: 0,
          style: {
            color: '#000000',
            fontSize: '14px'
          }
        },
        colors: ['#FF4500'],
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            colorStops: [
              {
                offset: 100,
                color: '#FFFFFF',
                opacity: 0
              },
              {
                offset: 0,
                color: '#000000',
                opacity: 0
              }
            ]
          }
        },
        markers: {
          size: 8
        },
        chart: {
          id: 'plot',
          events: {
            markerClick: (event, chartContext, { seriesIndex, dataPointIndex, config }) => {
              if (dataPointIndex === 0) {
                const board = new ffish.Board(this.$store.getters.variant)
                const startFen = board.fen()
                this.$store.dispatch('fen', startFen)
                return
              }
              const move = this.moves[dataPointIndex - 1]
              this.$store.dispatch('fen', move.fen)
            }
          }
        },
        xaxis: {
          type: 'category',
          categories: ['Start']
        },
        yaxis: {
          title: {
            text: 'Eval'
          }
        }
      },
      series: [{
        name: 'Evaluation',
        data: []
      }]
    }
  },
  computed: {
    moves () {
      return this.$store.getters.moves
    },
    ...mapGetters(['points', 'turn'])
  },
  watch: {
    points () {
      this.updatePoints()
    },
    turn () {
      this.updateGraph()
    }
  },
  beforeCreate () {
    console.log('beforeCreate()')
    new Module().then(loadedModule => {
      ffish = loadedModule
      console.log(`initialized ${ffish} ${loadedModule}`)
      const game = new ffish.Board()
      console.log(game.fen())
    })
  },
  methods: {
    updatePoints () {
      this.currentValue = this.$store.getters.cpforWhiteStr
      if ((this.currentValue.includes('#') && !this.currentValue.includes('-')) || this.currentValue > 10) {
        this.currentValue = 10
      } else if ((this.currentValue.includes('#') && this.currentValue.includes('-')) || this.currentValue < -10) {
        this.currentValue = -10
      }
    },
    updateGraph () {
      this.evalArray.push(this.currentValue)
      const min = Math.min(...this.evalArray)
      const max = Math.max(...this.evalArray)
      let newOffset = 0
      if (min >= 0) {
        newOffset = 100
      } else {
        newOffset = Math.abs(max) + Math.abs(min)
        newOffset = Math.abs(max) / newOffset
      }
      if (newOffset < 1) {
        newOffset *= 100
      }
      this.series = [{
        data: this.evalArray
      }]
      newOffset = Math.ceil(newOffset)
      this.chartOptions.fill.gradient.colorStops[0].offset = newOffset
      if (this.chartOptions.fill.gradient.colorStops[1].opacity !== 0.8 && min < 0) {
        this.chartOptions.fill.gradient.colorStops[1].opacity = 0.8
      }
      this.chartOptions.xaxis.categories.push(this.moves[this.moves.length - 1].name)
    }

  }
}
</script>
