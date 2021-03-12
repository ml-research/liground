<template>
  <div>
    <div class="EvalPlotButton">
      Eval Depth:
      <span class="hide">
        Input a number to set the engine depth for the Eval Plot or leave it empty for a default of 20.
      </span>
    </div>
    <div class="inputDepth">
      <input
        id="in"
        class="inputField"
        type="number"
        :value="curVar"
        @change="updateEvalDepth"
      >
    </div>
    <button
      v-if="!running"
      class="button"
      @click="startEval"
    >
      StartEval
    </button>
    <button
      v-if="running"
      class="button"
      @click="stopEval"
    >
      CancelEval
    </button>
  </div>
</template>
<script>

export default {
  name: 'EvalPlotButton',
  components: {},
  data () {
    return {
      running: false,
      curVar: ''
    }
  },
  created () {
    document.addEventListener('finishedEval', () => {
      this.running = false
    })
  },
  methods: {
    updateEvalDepth (event) {
      if (event.target.value === '') {
        this.$store.commit('evalPlotDepth', 20)
        return
      }
      this.$store.commit('evalPlotDepth', event.target.value)
    },
    startEval () {
      if (this.$store.getters.moves.length === 0) {
        return
      }
      this.running = true
      document.dispatchEvent(new Event('startEval'))
    },
    stopEval () {
      this.running = false
      document.dispatchEvent(new Event('stopEval'))
    }
  }
}
</script>

<style scoped>
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.inputDepth {
  position: relative;
  display: inline-block;
  width: 50px;
}
.inputField {
  width: 50px;
}
.button {
  padding: 5px;
  border-radius: 50%;
  background-color:lightgray ;
  border: black;
  outline: none;
}
.button:hover {
  cursor: pointer;
}
.EvalPlotButton {
  display: inline-block;
  position: relative;
}
.EvalPlotButton .hide {
  visibility: hidden;
  background-color: white;
  color:black;
  text-align: center;
  position: absolute;
  z-index: 1;
  top:100%;
  left:0%;
}
.EvalPlotButton:hover .hide {
  visibility: visible;
  font-size: 12px;
}
</style>
