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
            markerClick: function (event, chartContext, { seriesIndex, dataPointIndex, config }) {
              console.log('marker at pos' + dataPointIndex)
              // load FEN von data
            }
          }
        },
        xaxis: {
          type: 'category',
          categories: ['']
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
      if (this.chartOptions.fill.gradient.colorStops[1].gradient !== 0.8 && min < 0) {
        this.chartOptions.fill.gradient.colorStops[1].gradient = 0.8
      }
    }

  }
}
</script>
