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
      chartOptions: {
        chart: {
          id: 'vuechart-example'
        },
        xaxis: {
          categories: ['Moves']
        },
        yaxis: {
          title: {
            text: 'Points'
          }
        }
      },
      series: [{
        name: 'evaluation',
        data: []
      }]
    }
  },
  computed: {
    ...mapGetters(['active'])
  },
  watch: {
    active () {
      this.updateChart()
    }
  },
  methods: {
    updateChart () {
      if (this.$store.getters.active === true) {
        this.series = [{
          data: [1, 2, 3]
        }]
      }
    }
  }
}
</script>
