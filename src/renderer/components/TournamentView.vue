<template>
  <div class="analysis">
    <TournamentHead
      @resetMultiEngine="resetEngines"
      @updateVariant="removeAllEngines"
    />
    <div class="analysis" v-if="engineSet == true">
    <AnalysisContainer
      v-for="engine in Engines"
      ref="analysiscontainer"
      :key="engine.number"
    />
    </div>
    <div class="b" v-if="engineSet == false">
      <button
        class="buttonBlue"
        @click="setEngines"
      >
        <b>Set Engines </b>
      </button>
    </div>
  </div>
</template>

<script>
import TournamentHead from './TournamentHead'
import AnalysisContainer from './AnalysisContainer.vue'

export default {
  name: 'TournamentView',
  components: {
    TournamentHead,
    AnalysisContainer
  },
  data () {
    return {
      Engines: [
        {
          number: 1
        }
      ],
      counter: 1,
      engineSet: false,
    }
  },
  methods: {
    removeAllEngines () {
      let i = this.counter
      for (i; i > 1; i--) {
        this.Engines.pop()
      }
      this.counter = 1
      this.$store.dispatch('engineIndex', this.counter)
    },
    resetEngines () {
      let i = 1
      for (i; i < this.counter; i++) {
        this.$refs.analysiscontainer[i].resetThisEngine()
      }
    },
    setEngines (){
      this.counter++
      this.Engines.push({ Engine: this.counter })
      this.engineSet = true
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
