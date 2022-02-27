<template>
  <div class="analysis">
    <AnalysisHead @resetMultiEngine="resetEngines" />
    <AnalysisContainer
      v-for="engine in Engines"
      ref="analysiscontainer"
      :key="engine.number"
    />
    <div class="b">
      <button
        class="buttonRed"
        @click="removeEngine"
      >
        <b>Remove Engine </b>
      </button>
      <button
        class="buttonBlue"
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
    resetEngines () {
      let i = 1
      for (i; i < this.counter; i++) {
        this.$refs.analysiscontainer[i].resetThisEngine()
      }
    },
    removeEngine () {
      if (this.counter > 1) {
        this.counter--
        this.Engines.pop()
        this.$store.dispatch('engineIndex', this.counter)
      }
    },
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
.buttonBlue {
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
.buttonBlue:hover {
  background-color: #8ea0e9;
  cursor: pointer;
}
.buttonRed {
  background-color: #b22222; /* Red */
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px Avenir;
  border-radius: 7px;
}
.buttonRed:hover {
  background-color: #8b1919;
}
.b {
  margin-top: 40px;
}
@keyframes bar-anim {
  0% {
      background-position: 0 0;
  }
  100% {
      background-position: 100000px 0;
  }
}

#move-history {
  text-align: left;
}

</style>
