<template>
  <div>
    <VueApexCharts
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
      currentValue: 0,
      chartOptions: {
        colors: ['#000000'],
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 1,
            opacityTo: 0,
            colorStops: [
              {
                offset: 67,
                // calc offset
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
          id: 'vuechart-example',
          events: {
            markerClick: function (event, chartContext, { seriesIndex, dataPointIndex, config }) {
              console.log('marker')
              // load FEN von data
            }
          }
        },
        xaxis: {
          categories: ['Start', '1. White', '1. Black']
        },
        yaxis: {
          title: {
            text: 'Points'
          }
        }
      },
      series: [{
        name: 'evaluation',
        data: [0, 5, -5, 4, -2, 6]
      }]
    }
  },
  computed: {
    ...mapGetters(['points', 'turn'])
  },
  watch: {
    points () {
      // korrekte Punktzahl übergeben
      // this.updatePoints()
    },
    turn () {
      // this.updateGraph()
    }
  },
  methods: {
    updatePoints () {
      this.currentValue = this.$store.getters.cpforWhiteStr
    },
    updateGraph () {
      this.evalArray.push(this.currentValue)
      console.log(this.evalArray)
      this.series = [{
        data: this.evalArray
      }]
    }
  }
}
</script>
