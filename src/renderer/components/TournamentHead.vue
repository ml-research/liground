<template>
  <div class="ceval grid-parent">
    LiGround
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
    <div
      id="TournamentSwitch"
    >
      Tournament
      <TournamentSwitch />
    </div>
  </div>
</template>

<script>
import Multiselect from 'vue-multiselect'
import Mode960 from './Mode960'
import { mapGetters, mapState } from 'vuex'
import TournamentSwitch from './TournamentSwitch.vue'

export default {
  name: 'TournamentHead',
  components: {
    Multiselect, Mode960, TournamentSwitch
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
    },
    ...mapGetters(['QuickTourIndex'])
  },
  methods: {
    updateVariant (payload) {
      this.$emit('updateVariant')
      this.$store.dispatch('variant', this.variantOptions.get(payload))
    },
    resetBoard () {
      if (confirm('Do you really want to reset the board?')) {
        document.dispatchEvent(new Event('resetPlot'))
        this.$store.dispatch('resetBoard', { is960: false }) // used to exit 960 Mode
        this.$emit('resetMultiEngine')
      }
    }
  }
}
</script>

<style scoped>
.reset {
  background-color:var(--button-color);
  color: white;
  outline: none;
  border-radius: 5px;
  box-shadow: 1px 1px 1px 1px black;
  padding-bottom: 5px;
  padding-top: 5px;
}
.resetButton {
  display: grid;
  padding-left: 4px;
}
.reset:hover {
  background-color: var(--hover-color);
  cursor:pointer;
}
.ceval {
  /* display: table */
  font-size: 15pt;
  height: 40px;
}
#TournamentSwitch{
  margin-top: 8px;
  display: flex;
}
.grid-parent {
  display: grid;
  grid-template-columns: auto auto auto auto auto auto;
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
