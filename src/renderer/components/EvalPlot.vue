<template>
  <div>
    <VueApexCharts
      height="250"
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
      setBetterValuesRunning: false,
      mainMoves: [],
      depthArr: [],
      currentCalcPos: undefined,
      first: 0,
      break: false,
      is960: false,
      chartOptions: {
        stroke: {
          width: 1
        },
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
          intersect: true,
          x: {
            show: false
          },
          marker: {
            show: false
          }
        },
        noData: {
          text: '',
          align: 'center',
          verticalAlign: 'middle',
          offsetX: 0,
          offsetY: 0,
          style: {
            color: 'var(--main-text-color)',
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
          size: 3,
          strokeWidth: 0
        },
        chart: {
          fontFamily: 'Noto Chess',
          id: 'plot',
          foreColor: 'var(--main-text-color)',
          events: { // changes the board position by clicking on a plot marker
            markerClick: (event, chartContext, { seriesIndex, dataPointIndex, config }) => {
              if (dataPointIndex === 0) {
                this.$store.dispatch('fen', this.startFen)
                return
              }
              const move = this.mainMoves[dataPointIndex - 1]
              this.$store.dispatch('fen', move.fen)
            }
          }
        },
        xaxis: {
          type: 'category',
          categories: ['Start'],
          style: {
            color: 'var(--main-text-color)'
          }
        },
        yaxis: {
          title: {
            text: 'Eval',
            style: {
              fontFamily: 'Helvetica',
              fontSize: 16,
              color: 'var(--main-text-color)'
            }
          }
        }
      },
      series: [{
        name: 'Evaluation',
        data: [],
        style: {
          color: 'var(--main-text-color)'
        }
      }]
    }
  },
  computed: {
    ...mapGetters(['variant', 'board', 'startFen', 'moves', 'openedPGN', 'cpForWhiteStr', 'depth', 'evalPlotDepth'])
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
    moves () { // extracts the main variant
      let move = this.$store.getters.mainFirstMove
      const tempMainMoves = []
      const check = this.chartOptions.xaxis.categories[1]
      if (check && (move && move.name !== check)) {
        this.clear()
      }
      if (move) {
        tempMainMoves.push(move)
        while (move.main) {
          move = move.main
          tempMainMoves.push(move)
        }
        this.checkForMainVariantChange(tempMainMoves)
        this.mainMoves = tempMainMoves
      }
    },
    depth () {
      if (!this.setBetterValuesRunning) {
        this.setBetterValuesRunning = true
        this.setBetterValue()
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
      this.evaluateHistory()
    })
    document.addEventListener('position', (e) => {
      this.currentCalcPos = e.detail.fen
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
      this.chartOptions.fill.gradient.colorStops[1].opacity = 0
      this.chartOptions.fill.gradient.colorStops[0].offset = 100
    },

    adjustPoints (Inpoints, index) { // sets min/max for graph and converts the results from engine to the correct format
      let turn
      if (this.chartOptions.xaxis.categories[index].includes('..')) {
        turn = 'black'
      } else {
        turn = 'white'
      }
      let points = String(Inpoints)
      if (points.includes('#') && points.includes('0') && turn === 'white') {
        return 10
      } else if (points.includes('#') && points.includes('0') && turn === 'black') {
        return -10
      } else {
        if (points.includes('#') && ((turn === 'black' && !points.includes('-')) || (turn === 'white' && points.includes('-')))) {
          return 10
        } else if (points.includes('#')) {
          return -10
        } else {
          points = parseFloat((parseInt(points) / 100).toFixed(2))
          if (turn === 'white') {
            points = points * -1
          }
          if (points > 10) {
            return 10
          } else if (points < -10) {
            return -10
          } else {
            return points
          }
        }
      }
    },

    calcOffset () { // calculates and sets the offset which is used to determine how much of the graph should be colored black
      const min = Math.min(...this.series[0].data)
      const max = Math.max(...this.series[0].data)
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
      const length = this.mainMoves.length
      if (this.mainMoves.length === 0) {
        return
      }
      let index = 0
      this.chartOptions.xaxis.categories.splice(0, this.chartOptions.xaxis.categories.length)
      this.chartOptions.xaxis.categories.push('Start')
      while (index < length) {
        if (index % 2 === 1) {
          this.chartOptions.xaxis.categories[index + 1] = '..' + this.mainMoves[index].name
        } else {
          this.chartOptions.xaxis.categories[index + 1] = this.mainMoves[index].name
        }
        index++
      }
      this.setDepth(this.mainMoves)
    },

    async evaluateHistory () { // updates the graph
      this.loadPlot()
      if (this.break) {
        this.break = false
        setTimeout(this.evaluateHistory, 1000)
        return
      }
      let index = 0
      let points = 0
      const tmpArray = this.series[0].data
      tmpArray[0] = 0
      const depth = this.evalPlotDepth
      while (index < this.mainMoves.length) {
        const xlength = this.chartOptions.xaxis.categories.length
        if (xlength - 1 !== this.mainMoves.length) {
          this.loadPlot()
        }
        if (this.series[0].data.length > xlength) {
          this.series[0].data.splice(0, xlength)
        }
        if (depth >= this.depthArr[index] || this.series[0].data[index + 1] === undefined) {
          points = await Engine.evaluate(this.mainMoves[index].fen, depth)
          if (this.break) { // stops evaluating
            this.break = false
            return
          }
          points = this.adjustPoints(points, index + 1)
          tmpArray[index + 1] = points
          this.series = [{
            data: tmpArray
          }]
          this.calcOffset()
        }
        index++
      }
      document.dispatchEvent(new Event('finishedEval')) // resets the button
    },
    setBetterValue () { // sets a better value for an already drawn plot
      let index = 0
      if (this.mainMoves === []) { // no values set
        return
      }
      while (index < this.series[0].data.length - 1) {
        const depth = this.$store.getters.depth
        if (this.currentCalcPos === this.mainMoves[index].fen) {
          if (depth > this.depthArr[index]) {
            this.depthArr[index] = depth
            const newArray = this.series[0].data
            newArray[index + 1] = this.adjustStr(this.cpForWhiteStr)
            this.series = [{
              data: newArray
            }]
            this.calcOffset()
          }
        }
        index++
      }
      this.setBetterValuesRunning = false
    },
    adjustStr (input) {
      let strPoints = input
      console.log(typeof (strPoints) + ' ' + strPoints)
      if (strPoints.includes('#')) {
        if (strPoints.includes('-')) {
          return -10
        } else {
          return 10
        }
      } else {
        if (strPoints.includes('-')) {
          strPoints = strPoints.substring(1, strPoints.length - 1)
          strPoints = parseFloat(strPoints) * -1
          if (strPoints < 10) {
            strPoints = -10
          }
          return strPoints
        } else {
          strPoints = strPoints.substring(1, strPoints.length - 1)
          strPoints = parseFloat(strPoints)
          if (strPoints > 10) {
            strPoints = 10
          }
          return strPoints
        }
      }
    },
    setDepth (arr) { // sets the depthArray
      const tmpArray = arr
      let index = 0
      const evalPlotDepth = this.evalPlotDepth
      while (index < tmpArray.length) {
        if (this.depthArr[index] === undefined || this.depthArr[index] < evalPlotDepth) {
          this.depthArr[index] = evalPlotDepth
        }
        index++
      }
    },
    checkForMainVariantChange (arr) { // if position no longer in main variant then it resets the depthArray at that position
      const depth = this.evalPlotDepth
      let move = this.mainMoves[0]
      if (!move) {
        return
      }
      this.clear()
      let tempMove = arr[0]
      let index = 0
      while (move && tempMove) {
        if (move.fen !== tempMove.fen) {
          this.depthArr[index] = depth
        }
        index++
        move = move.main
        tempMove = tempMove.main
      }
    }
  }
}
</script>
<style scoped>
.link {
  color: var(--main-text-color);
}
</style>
<style>
  .apexcharts-tooltip {
    background-color: var(--main-bg-color) !important;
    color: var(--main-text-color) !important;
  }
</style>
