<template>
  <div>
    <div
      class="EvalPlotButton"
      data-text="Input a number to set the engine depth for the Eval Plot."
    >
      Eval Depth:
    </div>
    <div class="inputDepth">
      <input
        v-model.number.lazy="depth"
        class="inputField"
        type="number"
        @keyup.enter="startEval"
      >
    </div>
    <button
      v-if="!running"
      class="button"
      @click="startEval"
    >
      Start
    </button>
    <button
      v-if="running"
      class="button"
      @click="stopEval"
    >
      Cancel
    </button>
  </div>
</template>

<script>
export default {
  name: 'EvalPlotButton',
  data () {
    return {
      running: false
    }
  },
  computed: {
    depth: {
      get () {
        return this.$store.getters.evalPlotDepth
      },
      set (value) {
        this.$store.commit('evalPlotDepth', typeof value === 'number' ? Math.max(value, 0) : 20)
      }
    }
  },
  created () {
    document.addEventListener('finishedEval', () => {
      this.running = false
    })
  },
  methods: {
    startEval () {
      if (this.$store.getters.moves.length === 0) {
        return
      }
      this.running = true
      document.dispatchEvent(new Event('startEval'))
    },
    stopEval () {
      this.running = false
      document.dispatchEvent(new Event('stopPlot'))
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
  width: 40px;
}
.inputField {
  width: 25px;
  background-color: var(--second-bg-color);
  color: var(--main-text-color);
}
.inputField::placeholder {
  color: var(--main-text-color);
}
.button {
  padding: 3px;
  border-radius: 3px;
  background-color:var(--button-color);
  color: white;
  box-shadow: 1px 1px 1px 1px black;
  outline: none;
}
.button:hover {
  background-color: var(--hover-color);
  cursor: pointer;
}
.EvalPlotButton {
  display: inline-block;
  position: relative;
}
.EvalPlotButton::before{
  content: attr(data-text);
  position: absolute;
  top: 120%;
  font-size: 12px;
  background-color: var(--tooltip-color);
  color:var(--main-text-color);
  box-shadow:  5px 5px 10px 2px black;
  border-radius: 5px;
  z-index: 2;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease-in-out;
}
.EvalPlotButton::after{
  content: "";
  position: absolute;
  z-index: 2;
  top: 120%;
  margin-top: -20px;
  left: 50%;
  transform: translateX(-20%);
  border: 10px solid #000;
  border-color: transparent transparent var(--tooltip-color) transparent ;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease-in-out;
}
.EvalPlotButton:hover::before,
.EvalPlotButton:hover::after {
  opacity: 1;
  visibility: visible;
  transition-delay: 150ms;
}
</style>
