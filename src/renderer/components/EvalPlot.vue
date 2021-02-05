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

export default {
  name: 'EvalPlot',
  components: {
    VueApexCharts
  },
  data: function () {
    return {
      evalArray: [0],
      lastValue: 0,
      currentValue: [0],
      is960: false,
      chartOptions: {
        dataLabels: {
          enabled: false
        },
        grid: {
          yaxis: {
            lines: {
              show: false
            }
          }
        },
        tooltip: {
          shared: false,
          intersect: true
        },
        noData: {
          text: 'Start the Engine for data and do your 2nd move',
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
                color: '#888888',
                opacity: 0.8
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
          size: 4
        },
        chart: {
          id: 'plot',
          events: {
            markerClick: (event, chartContext, { seriesIndex, dataPointIndex, config }) => {
              if (dataPointIndex === 0) {
                this.$store.dispatch('fen', this.startFen)
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
    ...mapGetters(['points', 'turn', 'selectedGame', 'variant', 'board', 'startFen', 'moves'])
  },
  watch: {
    board () {
      const board960 = this.$store.getters.is960
      if (board960 && !this.is960) {
        this.clear()
        this.is960 = true
      }
      if (board960 && this.is960) {
        this.is960 = false
      }
    },
    variant () {
      this.clear()
    },
    points () {
      this.updatePoints()
    },
    turn () {
      this.updateGraph()
    },
    selectedGame () {
      this.clear()
      this.loadPGNData()
    },
    moves () {
      return this.moves
    }
  },
  created () {
    document.addEventListener('resetPlot', () => {
      this.clear()
    })
  },
  methods: {
    clear () {
      this.lastValue = 0
      this.chartOptions.xaxis.categories.splice(0, this.chartOptions.xaxis.categories.length)
      this.chartOptions.xaxis.categories.push('Start')
      this.series = [{
        data: []
      }]
      this.evalArray = [0]
      this.chartOptions.fill.gradient.colorStops[1].opacity = 0
      this.currentValue = [0]
    },
    updatePoints () {
      if (this.moves.length === 0) {
        return
      }
      const index = this.moves.length
      this.currentValue[index] = this.$store.getters.cpForWhiteStr
      if ((this.currentValue[index].includes('#') && !this.currentValue[index].includes('-')) || this.currentValue[index] > 10) {
        this.currentValue[index] = 10
      } else if ((this.currentValue[index].includes('#') && this.currentValue[index].includes('-')) || this.currentValue[index] < -10) {
        this.currentValue[index] = -10
      }
    },
    updateGraph () {
      if (this.moves.length <= 1) {
        this.evalArray = [0]
        return
      }
      const index = this.moves.length - 1
      if (this.moves[index - 1].name === this.chartOptions.xaxis.categories[index] || '..' + this.moves[index - 1].name === this.chartOptions.xaxis.categories[index]) {
        return
      }

      if (this.currentValue[index] === '±0.00' || this.currentValue[index] === undefined) {
        this.evalArray.push(this.lastValue)
      } else {
        this.evalArray.push(this.currentValue[index])
        this.lastValue = this.currentValue[index]
      }
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
      if (this.moves[this.moves.length - 2].ply % 2 === 0) {
        this.chartOptions.xaxis.categories.push('..' + this.moves[this.moves.length - 2].name)
      } else {
        this.chartOptions.xaxis.categories.push(this.moves[this.moves.length - 2].name)
      }
    },
    loadPGNData () { // pushes all the moves to the plot when loading a pgn
      const newArray = [0]
      let index = 0
      const length = this.moves.length
      while (index < length - 1) {
        newArray.push(0)
        if (index % 2 === 1) {
          this.chartOptions.xaxis.categories.push('..' + this.moves[index].name)
        } else {
          this.chartOptions.xaxis.categories.push(this.moves[index].name)
        }
        index++
      }
      this.evalArray = newArray
      this.series = [{
        data: newArray
      }]
    }

  }
}
</script>
