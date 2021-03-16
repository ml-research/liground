<template>
  <div>
    <div class="EvalPlotButton">
      Eval Depth:
      <span class="hide tooltip">
        Input a number to set the engine depth for the Eval Plot.
      </span>
    </div>
    <div class="inputDepth">
      <input
        id="in"
        class="inputField"
        type="number"
        :value="plotDepth"
        :placeholder="plotDepth"
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
      running: false
    }
  },
  computed: {
    plotDepth () {
      return this.$store.getters.evalPlotDepth
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
      this.$store.commit('evalPlotDepth', parseInt(event.target.value))
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
      document.dispatchEvent(new Event('resetPlot'))
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
  background-color: var(--second-bg-color);
  color: var(--main-text-color);
}
.inputField::placeholder {
  color: var(--main-text-color);
}
.button {
  padding: 5px;
  border-radius: 50%;
  background-color:var(--button-color);
  color: white;
  border: black;
  outline: none;
}
.button:hover {
  cursor: pointer;
}
.tooltip::before {
  content: "";
  position: absolute;

  top: 0%;
  margin-top: -20px;
  left: 50%;
  transition: opacity 0.3s ease-in-out;
  border: 10px solid #000;
  border-color: transparent transparent var(--tooltip-color) transparent ;
  opacity: 0;
}
.EvalPlotButton:hover .tooltip::before {
  opacity: 1;
  
}
.EvalPlotButton {
  display: inline-block;
  position: relative;
  padding-top: 5px;
  padding-left: 10px;
}
.EvalPlotButton .hide {
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
  margin-top: 15px;
  background-color: var(--tooltip-color);
  color: var(--main-text-color);
  box-shadow:  5px 5px 10px 2px black;
  border-radius: 5px;
  text-align: center;
  font-size: 12px;
  position: absolute;
  z-index: 1;
  top:100%;
  left:0%;
}
.EvalPlotButton:hover .hide {
  opacity: 1;
}
</style>
