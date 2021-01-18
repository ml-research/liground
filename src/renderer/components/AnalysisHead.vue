<template>
  <div class="ceval grid-parent">
    <i class="logo icon mdi mdi-feature-search-outline" />LiGround
    <multiselect
      class="multiselect"
      :value="displayVariant"
      :options="options"
      :allow-empty="false"
      :placeholder="selected"
      :show-labels="false"
      @input="updateVariant"
    />
    <PrettyCheck
      class="p-icon p-curve p-smooth"
      color="primary-o"
    >
      <em
        slot="extra"
        class="icon mdi mdi-check"
      />
      960 Mode
    </PrettyCheck>
    <input
      type="button"
      value="Reset"
      class="reset"
      @click="resetBoard"
    >
  </div>
</template>

<script>
import PrettyCheck from 'pretty-checkbox-vue/check'
import Multiselect from 'vue-multiselect'
import { mapState } from 'vuex'

export default {
  name: 'AnalysisHead',
  components: {
    PrettyCheck, Multiselect
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
      this.$store.dispatch('started', false) // from the previously used method, not sure why this was here, it seemed to work without this line
      this.$store.dispatch('variant', this.variantOptions.get(payload))
    },
    resetBoard () {
      if (confirm('Do you really want to reset the board?')) {
        this.$store.dispatch('resetBoard', false) // TODO when implementing 960 Mode false should probably be changed to some other value and changes to the store method will be necessary
      }
    }
  }
}
</script>

<style scoped>
.reset {
  background-color:lightgray ;
  border: black;
  outline: none;
}
.reset:hover {
  cursor:pointer;
}
.ceval {
  /* display: table */
  font-size: 15pt;
  height: 40px;
  width: 600px;
}
.multiselect {
  width: 200px;
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
