<template>
<div class='ceval grid-parent'>
  <div v-if="active">
  <div class="orbit-spinner">
  <div class="orbit"></div>
  <div class="orbit"></div>
  <div class="orbit"></div>
  </div>
</div>

<i class="logo icon mdi mdi-feature-search-outline"/>LiGround
<multiselect class="multiselect" :value="displayVariant" :options="options" :allow-empty="false" :placeholder="selected" :show-labels="false" @input="updateVariant"></multiselect>
   <PrettyCheck class="p-icon p-curve p-smooth" color="primary-o">
    <i slot="extra" class="icon mdi mdi-check"></i>
    960 Mode
</PrettyCheck>
</div>
</template>

<script>
import PrettyCheck from 'pretty-checkbox-vue/check'
import Multiselect from 'vue-multiselect'
import Vuex from 'vuex'

const { mapActions, mapState } = Vuex

export default {
  name: 'AnalysisView',
  components: {
    PrettyCheck, Multiselect
  },
  data () {
    return {
      selected: '♟️ Standard',
    }
  },
  methods: {
    updateVariant(payload) {
      this.$store.dispatch('started', false) //from the previously used method, not sure why this was here, it seemed to work without this line
      this.$store.dispatch('variant', this.variantOptions.get(payload))
    }
  },
  computed: {
    options(){
      let varop = Object.keys(this.$store.getters.variantOptions.getAll()) //returns all keys in variantOptions, those are then listed in the dropdown menu
      return varop
    },
    displayVariant() { //retuns the "nice" name of the current variant
        return this.variantOptions.revGet(this.variant)
    },
    active () {
      return this.$store.getters.active
    },
    ...mapState(['variant']),
    variantOptions () {
      return this.$store.getters.variantOptions
    }
  }
}
</script>

<style scoped>
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
.orbit-spinner {
  /* color: blue; */
  color: '#2196F3';
  /* size: 50; */
  /* animation-duration: 4000;
  color: '#6ca040'; */
}
.logo {
    font-size: 15pt;
    font-family: sans-serif;
}

.orbit-spinner, .orbit-spinner * {
      box-sizing: border-box;
}

.orbit-spinner {
  height: 55px;
  width: 55px;
  border-radius: 50%;
  perspective: 800px;
}

.orbit-spinner .orbit {
  position: absolute;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.orbit-spinner .orbit:nth-child(1) {
  left: 0%;
  top: 0%;
  animation: orbit-spinner-orbit-one-animation 4200ms linear infinite;
  border-bottom: 3px solid #2196F3;
}

.orbit-spinner .orbit:nth-child(2) {
  right: 0%;
  top: 0%;
  animation: orbit-spinner-orbit-two-animation 4200ms linear infinite;
  border-right: 3px solid #2a699b;
}

.orbit-spinner .orbit:nth-child(3) {
  right: 0%;
  bottom: 0%;
  animation: orbit-spinner-orbit-three-animation 4200ms linear infinite;
  border-top: 3px solid #a1cff4;
}

@keyframes orbit-spinner-orbit-one-animation {
  0% {
    transform: rotateX(35deg) rotateY(-45deg) rotateZ(0deg);
  }
  100% {
    transform: rotateX(35deg) rotateY(-45deg) rotateZ(360deg);
  }
}

@keyframes orbit-spinner-orbit-two-animation {
  0% {
    transform: rotateX(50deg) rotateY(10deg) rotateZ(0deg);
  }
  100% {
    transform: rotateX(50deg) rotateY(10deg) rotateZ(360deg);
  }
}

@keyframes orbit-spinner-orbit-three-animation {
  0% {
    transform: rotateX(35deg) rotateY(55deg) rotateZ(0deg);
  }
  100% {
    transform: rotateX(35deg) rotateY(55deg) rotateZ(360deg);
  }
}
</style>
