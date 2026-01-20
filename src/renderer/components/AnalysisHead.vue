<template>
  <div class="ceval grid-parent">
    LiGround
    <Multiselect
      v-if="QuickTourIndex !== 7"
      class="multiselect"
      :value="displayVariant"
      :options="options"
      :allow-empty="false"
      :show-labels="false"
      @input="updateVariant"
    />
    <Multiselect
      v-else
      class="multiselect-qt"
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
    <Mode960 v-if="QuickTourIndex !== 8" />
    <Mode960
      v-else
      id="Mode960-qt"
    />
    <div
      v-if="QuickTourIndex !== 9"
      id="PvESwitch"
    >
      PvE
      <PvESwitch />
    </div>
    <div
      v-else
      id="PvESwitch-qt"
    >
      PvE
      <PvESwitch />
    </div>

    <!-- Start New Game button shown next to PvE switch -->
    <div v-if="QuickTourIndex !== 10" id="StartGameButton">
      <button class="startGame" @click="openStartModal">Start New Game</button>
    </div>
    <div v-else id="StartGameButton-qt">
      <button class="startGame-qt" @click="openStartModal">Start New Game</button>
    </div>

    <!-- Modal component for selecting roles for white/black (UI only) -->
    <StartGameModal :visible="showStartModal" @close="closeStartModal" @start="handleStart" />
  </div>
</template>

<script>
import Multiselect from 'vue-multiselect'
import Mode960 from './Mode960'
import PvESwitch from './PvESwitch.vue'
import StartGameModal from './StartGameModal.vue' // Modal to select Player/Engine for White & Black
import { mapGetters, mapState } from 'vuex' 

export default {
  name: 'AnalysisHead',
  components: {
    Multiselect, Mode960, PvESwitch, StartGameModal
  },
  data () {
    return {
      selected: '♟️ Standard',
      showStartModal: false // controls visibility of the start game modal
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
    },

    // Open the Start Game modal
    openStartModal () {
      this.showStartModal = true
    },

    // Close the Start Game modal
    closeStartModal () {
      this.showStartModal = false
    },

    // Handle start request from modal; this is a UI-only stub for now
    // Payload example: { white: 'player'|'engine', black: 'player'|'engine' }
    handleStart (payload) {
      // TODO: wire-up actual game start logic in future
      console.log('[StartGame] Requested start with', payload)
      this.$emit('startNewGame', payload) // notify parent (if needed)
      this.closeStartModal()
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
  height: auto;
  padding: 15px 10px;
  background-color: var(--bg-color, #f5f5f5);
  border-bottom: 2px solid #ddd;
  position: relative;
  z-index: 10;
}
#Mode960-qt{
  border: 5px solid var(--quicktour-highlight);
}
.multiselect-qt{
  border: 5px solid var(--quicktour-highlight);
}
#PvESwitch-qt{
  margin-left: 8px;
  display: flex;
  border: 5px solid var(--quicktour-highlight);
}
#PvESwitch{
  margin-top: 8px;
  display: flex;
}

/* Start game button styles */
#StartGameButton-qt{
  margin-left: 8px;
  display: flex;
  border: 5px solid var(--quicktour-highlight);
}
#StartGameButton{
  margin-top: 8px;
  display: flex;
}
.startGame {
  background-color: #2ecc71; /* green */
  color: white;
  border-radius: 5px;
  padding: 6px 10px;
  border: none;
}
.startGame:hover {
  background-color: #23c663;
  cursor: pointer;
}
.startGame-qt{
  background-color: #2ecc71;
  color: white;
  border-radius: 5px;
  padding: 6px 10px;
  border: none;
  box-shadow: 0 0 0 3px var(--quicktour-highlight) inset;
}
.grid-parent {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
  justify-content: flex-start;
}
.logo {
  font-size: 15pt;
  font-family: sans-serif;
}

</style>
