<template>
  <div>
    <VueApexCharts width="710" height="260" type="area" :options="options" :series="series"></VueApexCharts>
  </div>
</template>


<script>
import VueApexCharts from 'vue-apexcharts'

export default {
  name: 'EvalPlot',
  components: {
    VueApexCharts
  },
  props: {
    msg: String
  },
  data: function () {
    return {
      options: {
        chart: {
          id: 'vuechart-example'
        },
        xaxis: {
          categories: [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5]
        },
        yaxis: {
          title: {
            text: 'Evaluation [cp]'
          }
        }
      },
      series: [{
        name: 'evaluation',
        data: [10, 23, 102, -12, -24, +34, -200, -320]
      }]
    }
  }
}
</script>
