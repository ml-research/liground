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
import { mapGetters } from 'vuex'

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
        data: ['1', '2']
      }]
    }
  },
  computed: {
    ...mapGetters(['active'])
  },
  watch: {
    active () {
      this.gainData()
    }
  },
  methods: {
    gainData () {
      if (this.$store.getters.active === true) {
        const newData = this.series.data
        console.log(newData)
        // newData.push('1')
        this.series = [{
          data: newData
        }]
      }
    }
  }
}
</script>
