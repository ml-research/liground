<template>
  <div class="ceval grid-parent">
    <i class="logo icon mdi mdi-feature-search-outline" />LiGround
    <Multiselect
      class="multiselect"
      :value="displayVariant"
      :options="options"
      :allow-empty="false"
      :show-labels="false"
      @input="updateVariant"
    />
    <div class="resetButton">
      <input
        type="button"
        value="Reset"
        class="reset"
        @click="resetBoard"
      >
    </div>
    <Mode960 />
  </div>
</template>

<script>
import Multiselect from 'vue-multiselect'
import Mode960 from './Mode960'
import { mapState } from 'vuex'

export default {
  name: 'AnalysisHead',
  components: {
    Multiselect, Mode960
  },
  data () {
    return {
      selected: '♟️ Standard'
    }
  },
  computed: {
    options () {
      const varop = Object.keys(this.$store.getters.variantOptions.getAll()) // returns all keys in variantOptions, those are then listed in the dropdown menu
      return varop
    },
    active () {
      return this.$store.getters.active
    },
    ...mapState(['variant']),
    variantOptions () {
      return this.$store.getters.variantOptions
    },
    displayVariant () { // retuns the "nice" name of the current variant
      return this.variantOptions.revGet(this.variant)
    }
  },
  methods: {
    updateVariant (payload) {
      this.$store.dispatch('variant', this.variantOptions.get(payload))
    },
    resetBoard () {
      if (confirm('Do you really want to reset the board?')) {
        document.dispatchEvent(new Event('resetPlot'))
        this.$store.dispatch('resetBoard', { is960: false }) // used to exit 960 Mode
      }
    }
  }
}
</script>

<style scoped>
.reset {
  background-color:lightgrey;
  border: black;
  outline: none;
  border-radius: 100%;
  padding-bottom: 5px;
  padding-top: 5px;
}
.resetButton {
  display: grid;
  padding-left: 5px;
}
.reset:hover {
  cursor:pointer;
}
.ceval {
  /* display: table */
  font-size: 15pt;
  height: 40px;
}

.grid-parent {
  display: grid;
  grid-template-columns: auto auto auto auto auto;
  align: center;
  text-align: bottom;
  align-items: center;
  /* vertical-align: middle; */
}
.logo {
    font-size: 15pt;
    font-family: sans-serif;
}

</style>
