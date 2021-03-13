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
      mainMoves: [],
      first: 0,
      fenArray: ['Start'],
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
                color: '#E3E3E3',
                opacity: 1
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
          events: { // changes the board position by clicking on a plot marker
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
    ...mapGetters(['variant', 'board', 'startFen', 'moves', 'openedPGN'])
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
    },
    moves () {
      let move = this.$store.getters.mainFirstMove
      this.mainMoves = []
      if (move) {
        this.mainMoves.push(move)
        while (move.main) {
          move = move.main
          this.mainMoves.push(move)
        }
      }
    },
    openedPGN () {
      if (this.first >= 2 || this.series[0].data.length > 0) {
        this.break = true
        this.clear()
      }
      this.first++
    }
  },
  created () {
    document.addEventListener('resetPlot', () => {
      this.break = true
      this.clear()
    })
    document.addEventListener('startEval', () => {
      this.loadPlot()
    })
    document.addEventListener('stopEval', () => {
      this.break = true
      this.clear()
    })
  },
  methods: {
    clear () { // cleans the whole plot
      document.dispatchEvent(new Event('finishedEval'))
      this.chartOptions.xaxis.categories.splice(0, this.chartOptions.xaxis.categories.length)
      this.chartOptions.xaxis.categories.push('Start')
      this.series = [{
        data: []
      }]
      this.evalArray = [0]
      this.chartOptions.fill.gradient.colorStops[1].opacity = 0
      this.chartOptions.fill.gradient.colorStops[0].offset = 100
    },

    adjustPoints (points) { // sets min/max for graph and converts the results from engine to the correct format
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

    calcOffset () { // calculates and sets the offset which is used to determine how much of the graph should be colored black
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
      if (this.moves.length === 0) {
        return
      }
      const newArray = [0]
      let index = 0
      const length = this.moves.length
      while (index < length) {
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
      await this.evaluateHistory()
    },

    async evaluateHistory () { // updates the graph
      if (this.break) {
        setTimeout(this.evaluateHistory, 1000)
        return
      }
      let index = 0
      let points = 0
      const depth = this.$store.getters.evalPlotDepth
      while (index < this.series[0].data.length - 1) {
        try {
          points = await Engine.evaluate(this.moves[index].fen, depth)
          if (this.break) { // cleares the graph when its supposed to
            this.break = false
            return
          }
          this.break = false
          points = this.adjustPoints(points)
          this.evalArray[index + 1] = points
          this.series = [{
            data: this.evalArray
          }]
          this.calcOffset()
          index++
        } catch (error) {
          this.clear()
        }
      }
      document.dispatchEvent(new Event('finishedEval')) // resets the button
    }
  }
}
</script>
