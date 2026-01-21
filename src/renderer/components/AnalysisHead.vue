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

    <!-- Start New Game button  -->
    <div v-if="QuickTourIndex !== 10" id="StartGameButton">
      <button class="startGame" @click="openStartModal">Start New Game</button>
    </div>
    <div v-else id="StartGameButton-qt">
      <button class="startGame-qt" @click="openStartModal">Start New Game</button>
    </div>
    <StartGameModal :visible="showStartModal" @close="closeStartModal" @start="handleStart" />
    <GameEndModal
      :visible="showGameEndModal"
      :gameConfig="gameConfig"
      :stats="gameStats"
      @close="closeGameEndModal"
    />
  </div>
</template>

<script>
import Multiselect from 'vue-multiselect'
import Mode960 from './Mode960'
import StartGameModal from './StartGameModal.vue'
import GameEndModal from './GameEndModal.vue'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'AnalysisHead',
  components: {
    Multiselect, Mode960, StartGameModal, GameEndModal
  },
  data () {
    return {
      selected: '♟️ Standard',
      showStartModal: false
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
    ...mapGetters(['QuickTourIndex', 'gameConfig', 'showGameEndModal']),
    showGameEndModal () {
      return this.$store.getters.showGameEndModal
    },
    gameConfig () {
      return this.$store.getters.gameConfig
    },
    gameStats () {
      // TODO: compute stats from board state (accuracy, move count, etc.)
      return {
        whiteAccuracy: null,
        blackAccuracy: null,
        moveCount: this.$store.getters.moves.length,
        gameLength: null
      }
    }
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

    openStartModal () {
      this.showStartModal = true
    },

    closeStartModal () {
      this.showStartModal = false
    },

    // Payload example: { white: 'player'|'engine', black: 'player'|'engine' }
    handleStart (payload) {
      this.$store.dispatch('resetBoard', { is960: false })
      this.$store.dispatch('setGameConfig', payload)
      
      const isPvP = payload.white === 'player' && payload.black === 'player'
      const isEvE = payload.white === 'engine' && payload.black === 'engine'
      const isPvE = !isPvP && !isEvE
      
      if (isPvE) {
        const playerIsWhite = payload.white === 'player'
        this.$store.dispatch('PvEtrue', { playerIsWhite })
      } else if (isEvE) {
        // start Engine vs Engine with provided engine names and limiter settings
        this.$store.dispatch('EvEtrue', {
          gameMode: payload.gameMode,
          whiteEngine: payload.whiteEngine,
          blackEngine: payload.blackEngine,
          whiteLimiter: payload.whiteLimiter,
          blackLimiter: payload.blackLimiter
        })
      } else {
        // make sure PvE/EvE are disabled for pure PvP
        this.$store.dispatch('PvEfalse')
        this.$store.dispatch('EvEfalse')
      }
      
      this.$emit('startNewGame', payload)
      this.closeStartModal()
    },

    closeGameEndModal () {
      this.$store.dispatch('closeGameEndModal')
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
#Mode960-qt{
  border: 5px solid var(--quicktour-highlight);
}
.multiselect-qt{
  border: 5px solid var(--quicktour-highlight);
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
