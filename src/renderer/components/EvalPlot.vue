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
        tooltip: {
          shared: false,
          intersect: true
        },
        dataLabels: {
          enabled: true,
          distributed: true
        },
        chart: {
          id: 'vuechart-example',
          events: {
            dataPointSelection: function (event, chartContext, config) {
              console.log('datapoint')
            },
            mounted: function (chartContext, config) {
              console.log('mounted')
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
        data: [1, 2, 3, 4, -4]
      }],
      markers: {
        size: 7,
        onClick: function (e) {
          console.log('markerclicked')
        },
        data: [1, 2, 3, 4]
      }
    }
  },
  computed: {
    ...mapGetters(['points', 'turn'])
  },
  watch: {
    points () {
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
