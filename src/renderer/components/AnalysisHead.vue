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

    <!-- PGN Browser button -->
    <button class="pgnBrowserBtn" @click="openPgnBrowser" title="Open PGN Browser">📋 PGN Browser</button>

    <!-- PGN Browser Modal -->
    <div v-if="showPgnModal" class="pgn-modal-overlay" @click.self="showPgnModal = false">
      <div class="pgn-modal-content">
        <div class="pgn-modal-header">
          <h3>PGN Browser</h3>
          <button class="pgn-modal-close" @click="showPgnModal = false">×</button>
        </div>
        <div class="pgn-modal-body">
          <PgnBrowser />
        </div>
      </div>
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
import PgnBrowser from './PgnBrowser.vue'
import { mapGetters, mapState } from 'vuex' 

export default {
  name: 'AnalysisHead',
  components: {
    Multiselect, Mode960, PvESwitch, StartGameModal, PgnBrowser
  },
  data () {
    return {
      selected: '♟️ Standard',
      showStartModal: false, // controls visibility of the start game modal
      showPgnModal: false // controls visibility of the PGN browser modal
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

    // Open PGN Browser modal
    openPgnBrowser () {
      this.showPgnModal = true
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
  max-width: 100%;
  overflow-x: auto;
  padding: 0 10px;
}

@media (max-width: 1024px) {
  .grid-parent {
    gap: 10px;
    font-size: 13pt;
  }
}

@media (max-width: 768px) {
  .grid-parent {
    gap: 8px;
    font-size: 12pt;
    padding: 0 5px;
  }
  
  .startGame,
  .startGame-qt {
    padding: 4px 8px;
    font-size: 12px;
  }
  
  .reset {
    padding-top: 3px;
    padding-bottom: 3px;
    font-size: 12px;
  }
}
.logo {
  font-size: 15pt;
  font-family: sans-serif;
}

.pgnBrowserBtn {
  background-color: #6c757d;
  color: white;
  border-radius: 5px;
  padding: 6px 10px;
  border: none;
  font-size: 14px;
  cursor: pointer;
}

.pgnBrowserBtn:hover {
  background-color: #5a6268;
}

.pgn-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.pgn-modal-content {
  background: var(--card-background, #fff);
  color: var(--text-color, #111);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  border-radius: 8px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.pgn-modal-header {
  padding: 14px 18px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pgn-modal-header h3 {
  margin: 0;
  font-size: 16px;
}

.pgn-modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-color, #111);
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pgn-modal-close:hover {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.pgn-modal-body {
  padding: 12px 16px;
  overflow: auto;
  flex: 1 1 auto;
}

</style>
