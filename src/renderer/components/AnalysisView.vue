<template>
  <div class="analysis">
    <AnalysisHead />
    <AnalysisContainer
      v-for="engine in Engines"
      :key="engine.number"
    />
    <div class="b">
      <button
        class="button"
        @click="addEngine"
      >
        <b>Add Engine </b>
      </button>
    </div>
  </div>
</template>

<script>
import AnalysisHead from './AnalysisHead'
import AnalysisContainer from './AnalysisContainer.vue'

export default {
  name: 'AnalysisView',
  components: {
    AnalysisHead,
    AnalysisContainer
  },
  data () {
    return {
      Engines: [
        {
          number: 1
        }
      ],
      counter: 1
    }
  },
  methods: {
    addEngine () {
      this.counter++
      this.Engines.push({ Engine: this.counter })
      this.$store.dispatch('engineIndex', this.counter)
    }
  }
}
</script>

<style scoped>
.analysis-container {
  margin-top: 30px;
  margin-bottom: 30px;
}
.button {
  background-color: #7289da; /* Green */
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px Avenir;
  border-radius: 7px;
}
.button:hover {
  background-color: #8ea0e9;
  cursor: pointer;
}
.b {
  margin-top: 40px;
}
</style>
