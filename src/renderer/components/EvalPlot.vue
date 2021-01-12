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
        chart: {
          id: 'vuechart-example'
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
        data: [1, 2, 3]
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
      this.updateGraph()
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
