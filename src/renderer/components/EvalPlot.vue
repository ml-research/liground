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
      break: false,
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
          text: '',
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
                color: '#E3E3E3', // mb choose whiter color
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
    ...mapGetters(['variant', 'board', 'startFen', 'moves'])
  },
  watch: {
    board () {
      const board960 = this.$store.getters.is960
      if (board960 && !this.is960) {
        this.clear()
        this.break = true
        this.is960 = true
      }
      if (board960 && this.is960) {
        this.is960 = false
      }
    },
    variant () {
      this.break = true
      this.clear()
    }
  },
  created () {
    document.addEventListener('resetPlot', () => {
      this.break = true
      this.clear()
    })
    document.addEventListener('runEval', () => {
      this.clear()
      this.loadPlot()
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
      this.chartOptions.fill.gradient.colorStops[0].offset = 100
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

    async loadPlot () { // pushes all the moves to the plot when button is pressed
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
    },

    async evaluateHistory (depth) { // updates the graph
      let index = 1
      let points = 0
      while (index < this.series[0].data.length - 1) {
        try {
          points = await Engine.evaluate(this.moves[index].fen, depth)
          if (this.break) {
            this.break = false
            this.clear()
            return
          }
          points = this.adjustPoints(points)
          this.evalArray[index] = points
          this.series = [{
            data: this.evalArray
          }]
          this.calcOffset()
          index++
        } catch (error) {
          this.clear()
        }
      }
    }
  }
}
</script>
