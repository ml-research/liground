<template>
  <div>
    <VueApexCharts
      width="710"
      height="260"
      type="area"
      :options="options"
      :series="series"
    />
  </div>
</template>

<script>
import VueApexCharts from 'vue-apexcharts'

export default {
  name: 'EvalPlot',
  components: {
    VueApexCharts
  },
  data: function () {
    return {
      options: {
        chart: {
          id: 'vuechart-example'
        },
        xaxis: {
          categories: ['THIS IS A DUMMY']
        },
        yaxis: {
          title: {
            text: 'THIS IS A DUMMY'
          }
        }
      },
      series: [{
        name: 'evaluation',
        data: []
      }]
    }
  }
}
</script>
