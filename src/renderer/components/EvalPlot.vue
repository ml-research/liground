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
import Engine from '../engine'

export default {
  name: 'EvalPlot',
  components: {
    VueApexCharts
  },
  data: function () {
    return {
      evalArray: [0],
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
    ...mapGetters(['selectedGame', 'variant', 'board', 'startFen', 'moves'])
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
    selectedGame () {
      this.clear()
      this.loadPGNData()
    },
    moves () {
      this.updateGraph()
    }
  },
  created () {
    document.addEventListener('resetPlot', () => {
      this.clear()
    })
  },
  methods: {
    clear () {
      this.chartOptions.xaxis.categories.splice(0, this.chartOptions.xaxis.categories.length)
      this.chartOptions.xaxis.categories.push('Start')
      this.series = [{
        data: []
      }]
      this.evalArray = [0]
      this.chartOptions.fill.gradient.colorStops[1].opacity = 0
    },

    adjustPoints (points) {
      if ((points.includes('#') && !points.includes('-'))) {
        points = 10
      } else if ((points.includes('#') && points.includes('-'))) {
        points = -10
      } else {
        points = (points / 100).toFixed(2)
      }
      if (points > 10) {
        points = 10
      } else if (points < -10) {
        points = -10
      }
      return points
    },

    async updateGraph () {
      if (this.moves.length > this.evalArray.length) {
        return
      }
      if (this.moves.length === 0) {
        this.evalArray = [0]
        return
      }
      console.log('called')
      const index = this.moves.length - 1
      let points = await Engine.evaluate(this.moves[index].fen, 5)
      console.log('before' + points)
      points = this.adjustPoints(points)
      console.log('after ' + points)
      this.evalArray.push(points)
      this.series = [{
        data: this.evalArray
      }]
      if (this.moves[this.moves.length - 1].ply % 2 === 0) {
        this.chartOptions.xaxis.categories.push('..' + this.moves[this.moves.length - 1].name)
      } else {
        this.chartOptions.xaxis.categories.push(this.moves[this.moves.length - 1].name)
      }
      this.calcOffset()
    },

    calcOffset () {
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
      newOffset = Math.ceil(newOffset)
      this.chartOptions.fill.gradient.colorStops[0].offset = newOffset
      if (this.chartOptions.fill.gradient.colorStops[1].opacity !== 0.8 && min < 0) {
        this.chartOptions.fill.gradient.colorStops[1].opacity = 0.8
      }
    },

    async loadPGNData () { // pushes all the moves to the plot when loading a pgn
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
      await this.evaluateHistory(10)
      // await this.evaluateHistory(20) // break when something (clear)
    },

    async evaluateHistory (depth) { // update graph bc of new move while still calc or at all
      let index = 1
      let points = 0
      while (index < this.series[0].data.length - 1) {
        points = await Engine.evaluate(this.moves[index].fen, depth)
        points = this.adjustPoints(points)
        this.evalArray[index] = points
        this.series = [{
          data: this.evalArray
        }]
        this.calcOffset()
        index++
      }
    }
  }
}
</script>
