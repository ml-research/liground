<template>
  <div>
    <div class="EvalPlotButton">
      Eval Depth:
      <span class="hide">
        Input a number to set the engine depth for the Eval Plot.
      </span>
    </div>
    <div class="inputDepth">
      <input
        v-model.number.lazy="depth"
        v-on:keyup.enter="startEval"
        class="inputField"
        type="number"
        
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
  background-color: var(--main-bg-color);
  color: var(--main-text-color);
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
