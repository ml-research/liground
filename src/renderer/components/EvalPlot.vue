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
      evalArray: [],
      calcOffset: 100,
      currentValue: 0,
      first: true,
      chartOptions: {
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
        colors: ['#000000'],
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 1,
            opacityTo: 0,
            colorStops: [
              {
                offset: 99, // this.calcOffset,
                color: '#FFFFFF',
                opacity: 0
              },
              {
                offset: 0,
                color: '#000000',
                opacity: 1
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
            markerClick: function (event, chartContext, { seriesIndex, dataPointIndex, config }) {
              console.log('marker')
              // load FEN von data
            }
          }
        },
        yaxis: {
          title: {
            text: 'Points'
          }
        }
      },
      series: [{
        name: 'evaluation',
        data: [0.61, -0.01]
      }]
    }
  },
  computed: {
    ...mapGetters(['points', 'turn'])
  },
  watch: {
    points () {
      this.updatePoints()
    },
    turn () {
      if (!this.first) {
        this.updateGraph()
      } else {
        this.first = false
      }
    }
  },
  methods: {
    updatePoints () {
      this.currentValue = this.$store.getters.cpforWhiteStr
      if ((this.currentValue.includes('#') && this.turn === 'white') || this.currentValue > 10) {
        this.currentValue = 10
      } else if ((this.currentValue.includes('#') && this.turn === 'black') || this.currentValue < -10) {
        this.currentValue = -10
      }
    },
    updateGraph () {
      this.evalArray.push(this.currentValue)
      const min = Math.min(...this.evalArray)
      const max = Math.max(...this.evalArray)
      console.log('max = ' + max)
      console.log('min = ' + min)
      let newOffset = 0
      if (min >= 0) {
        newOffset = 100
      } else if (Math.abs(min) > Math.abs(max)) {
        newOffset = Math.abs(max) + Math.abs(min)
        newOffset = Math.abs(min) / newOffset
      } else if (Math.abs(max) > Math.abs(min)) {
        newOffset = Math.abs(max) + Math.abs(min)
        newOffset = Math.abs(max) / newOffset
      }
      if (newOffset < 1) {
        newOffset *= 100
      }
      console.log('newOffset = ' + newOffset)
      newOffset = Math.round(newOffset)
      this.calcOffset = newOffset
      this.series = [{
        data: this.evalArray
      }]
      console.log('calcOffset = ' + this.calcOffset)
      this.chartOptions.fill.gradient.colorStops[0].offset = this.calcOffset
      
    }

  }
}
</script>
