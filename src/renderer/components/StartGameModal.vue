<template>
  <div v-if="visible" class="modal-overlay" @click.self="close">
    <div class="modal-content" role="dialog" aria-modal="true">
      <div class="modal-header">
        <h3>Start New Game</h3>
      </div>

      <!-- Modal body: choose Game Mode and Player/Engine for both sides -->
      <div class="modal-body">
        <div class="game-mode">
          <label for="game-mode-select"><b>Game mode</b></label>
          <select id="game-mode-select" v-model="selectedGameMode">
            <option v-for="opt in gameModeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>

        <div class="side-select">
          <label for="white-select"><b>White</b></label>
          <select id="white-select" v-model="whiteChoice">
            <option value="player">Player</option>
            <option value="engine">Engine</option>
          </select>

          <!-- Engine-specific controls for White -->
          <div v-if="whiteChoice === 'engine'" class="engine-config">
            <label><small><b>Engine</b></small></label>

            <div class="engine-select-row">
              <div class="engine-logo" :style="{ backgroundImage: whiteEngineLogo }" />
              <Multiselect
                v-model="whiteEngineObj"
                class="engine-select"
                label="name"
                track-by="name"
                :options="filteredEngines"
                :allow-empty="false"
                :show-labels="false"
                placeholder="Select engine"
                @change="onWhiteEngineChanged"
              />
            </div>

            <label class="engine-limiter">
              <input type="checkbox" v-model="whiteLimiterEnabled" /> Engine limiter
            </label>

            <div v-if="whiteLimiterEnabled" class="limiter-controls">
              <Multiselect
                v-model="whiteLimiterType"
                :options="options"
                :allow-empty="false"
                :show-labels="false"
              />
              <input
                type="number"
                class="limiter-input"
                v-model.number="whiteLimiterValue"
                :min="minForType(whiteLimiterType)"
              />
              <div class="limiter-unit">{{ unitForType(whiteLimiterType) }}</div>
            </div>
          </div>
        </div>

        <div class="side-select">
          <label for="black-select"><b>Black</b></label>
          <select id="black-select" v-model="blackChoice">
            <option value="player">Player</option>
            <option value="engine">Engine</option>
          </select>

          <!-- Engine-specific controls for Black -->
          <div v-if="blackChoice === 'engine'" class="engine-config">
            <label><small><b>Engine</b></small></label>

            <div class="engine-select-row">
              <div class="engine-logo" :style="{ backgroundImage: blackEngineLogo }" />
              <Multiselect
                v-model="blackEngineObj"
                class="engine-select"
                label="name"
                track-by="name"
                :options="filteredEngines"
                :allow-empty="false"
                :show-labels="false"
                placeholder="Select engine"
                @change="onBlackEngineChanged"
              />
            </div>

            <label class="engine-limiter">
              <input type="checkbox" v-model="blackLimiterEnabled" /> Engine limiter
            </label>

            <div v-if="blackLimiterEnabled" class="limiter-controls">
              <Multiselect
                v-model="blackLimiterType"
                :options="options"
                :allow-empty="false"
                :show-labels="false"
              />
              <input
                type="number"
                class="limiter-input"
                v-model.number="blackLimiterValue"
                :min="minForType(blackLimiterType)"
              />
              <div class="limiter-unit">{{ unitForType(blackLimiterType) }}</div>
            </div>
          </div>
        </div>

        <p class="hint">Choose whether each side should be controlled by a human player or an engine (PvP, PvE, EvE supported). Only engines that support the selected Game Mode are listed.</p>
      </div>

      <div class="modal-footer">
        <div class="footer-left">
          <button class="start-button" :disabled="startDisabled" :title="disabledReason" @click="startGame"><b>Start Game</b></button>
          <span v-if="disabledReason" class="disabled-hint">{{ disabledReason }}</span>
        </div>
        <button class="close-button" @click="close"><b>Close</b></button>
      </div>
    </div>
  </div>
</template>

<script>
import Multiselect from 'vue-multiselect'

export default {
  name: 'StartGameModal',
  props: {
    // Controls visibility of the modal; parent toggles it.
    visible: {
      type: Boolean,
      default: false
    }
  },
  components: { Multiselect },
  data () {
    return {
      // Limiter options per engine (UI-only)
      options: ['time', 'nodes', 'depth']
    }
  },
  computed: {
    // Friendly list for game mode selector
    gameModeOptions () {
      const varop = Object.keys(this.$store.getters.variantOptions.getAll())
      return varop.map(k => ({ value: this.$store.getters.variantOptions.get(k), label: k }))
    },

    // Engines that support the selected game mode
    filteredEngines () {
      return Object.entries(this.$store.state.allEngines)
        .map(([name, info]) => ({ name, ...info }))
        .filter(e => e.variants && e.variants.includes(this.selectedGameMode))
    },

    // Store-backed UI state (getters/setters sync with Vuex)
    selectedGameMode: {
      get () {
        const s = this.$store.state.startGameModal && this.$store.state.startGameModal.selectedGameMode
        return s || this.$store.getters.variant
      },
      set (v) {
        this.$store.commit('startGameModal', { selectedGameMode: v })
      }
    },

    whiteChoice: {
      get () { return (this.$store.state.startGameModal && this.$store.state.startGameModal.whiteChoice) || 'player' },
      set (v) { this.$store.commit('startGameModal', { whiteChoice: v }) }
    },

    blackChoice: {
      get () { return (this.$store.state.startGameModal && this.$store.state.startGameModal.blackChoice) || 'engine' },
      set (v) { this.$store.commit('startGameModal', { blackChoice: v }) }
    },

    whiteEngineObj: {
      get () {
        const name = this.$store.state.startGameModal && this.$store.state.startGameModal.whiteEngineName
        if (!name) return null
        const info = this.$store.state.allEngines && this.$store.state.allEngines[name]
        return Object.assign({ name }, info || {})
      },
      set (v) {
        const name = v && v.name ? v.name : v
        this.$store.commit('startGameModal', { whiteEngineName: name })
      }
    },

    blackEngineObj: {
      get () {
        const name = this.$store.state.startGameModal && this.$store.state.startGameModal.blackEngineName
        if (!name) return null
        const info = this.$store.state.allEngines && this.$store.state.allEngines[name]
        return Object.assign({ name }, info || {})
      },
      set (v) {
        const name = v && v.name ? v.name : v
        this.$store.commit('startGameModal', { blackEngineName: name })
      }
    },

    whiteLimiterEnabled: {
      get () { return !!(this.$store.state.startGameModal && this.$store.state.startGameModal.whiteLimiterEnabled) },
      set (v) { this.$store.commit('startGameModal', { whiteLimiterEnabled: !!v }) }
    },

    whiteLimiterType: {
      get () { return (this.$store.state.startGameModal && this.$store.state.startGameModal.whiteLimiterType) || 'time' },
      set (v) { this.$store.commit('startGameModal', { whiteLimiterType: v }) }
    },

    whiteLimiterValue: {
      get () { return (this.$store.state.startGameModal && this.$store.state.startGameModal.whiteLimiterValue) || 1000 },
      set (v) { this.$store.commit('startGameModal', { whiteLimiterValue: v }) }
    },

    blackLimiterEnabled: {
      get () { return !!(this.$store.state.startGameModal && this.$store.state.startGameModal.blackLimiterEnabled) },
      set (v) { this.$store.commit('startGameModal', { blackLimiterEnabled: !!v }) }
    },

    blackLimiterType: {
      get () { return (this.$store.state.startGameModal && this.$store.state.startGameModal.blackLimiterType) || 'time' },
      set (v) { this.$store.commit('startGameModal', { blackLimiterType: v }) }
    },

    blackLimiterValue: {
      get () { return (this.$store.state.startGameModal && this.$store.state.startGameModal.blackLimiterValue) || 1000 },
      set (v) { this.$store.commit('startGameModal', { blackLimiterValue: v }) }
    },

    whiteEngineLogo () {
      return this.whiteEngineObj ? `url(${this.whiteEngineObj.logo || ''})` : ''
    },

    blackEngineLogo () {
      return this.blackEngineObj ? `url(${this.blackEngineObj.logo || ''})` : ''
    }
  },
  watch: {
    // If game mode changes, ensure selected engines still compatible
    selectedGameMode (newMode) {
      if (this.whiteEngineObj && !(this.whiteEngineObj.variants && this.whiteEngineObj.variants.includes(newMode))) {
        this.$store.commit('startGameModal', { whiteEngineName: null })
      }
      if (this.blackEngineObj && !(this.blackEngineObj.variants && this.blackEngineObj.variants.includes(newMode))) {
        this.$store.commit('startGameModal', { blackEngineName: null })
      }
    },
    // When limiter type changes, apply sensible default values
    whiteLimiterType (type) {
      this.$store.commit('startGameModal', { whiteLimiterValue: this.defaultValueForType(type) })
    },
    blackLimiterType (type) {
      this.$store.commit('startGameModal', { blackLimiterValue: this.defaultValueForType(type) })
    }
  },
  methods: {
    close () {
      this.$emit('close')
    },

    onWhiteEngineChanged (selected) {
      this.whiteEngineObj = selected
    },

    onBlackEngineChanged (selected) {
      this.blackEngineObj = selected
    },

    minForType (type) {
      return 1
    },

    defaultValueForType (type) {
      switch (type) {
        case 'time': return 1000 // ms
        case 'nodes': return 5 // million
        case 'depth': return 20
        default: return 1
      }
    },

    unitForType (type) {
      switch (type) {
        case 'time': return 'ms'
        case 'nodes': return 'million'
        case 'depth': return 'ply'
        default: return ''
      }
    },

    async startGame () {
      if (this.selectedGameMode !== this.$store.getters.variant){
        await this.$store.dispatch('variant', this.selectedGameMode) 
      }
      const payload = {
        gameMode: this.selectedGameMode,
        white: this.whiteChoice,
        black: this.blackChoice,

        // Engines are only relevant when a side is set to 'engine'. We emit names for simplicity
        whiteEngine: this.whiteChoice === 'engine' && this.whiteEngineObj ? this.whiteEngineObj.name : null,
        blackEngine: this.blackChoice === 'engine' && this.blackEngineObj ? this.blackEngineObj.name : null,

        // Limiter configuration for PvE and EvE modes 
        whiteLimiter: this.whiteChoice === 'engine' ? {
          enabled: this.whiteLimiterEnabled,
          type: this.whiteLimiterType,
          value: this.whiteLimiterValue
        } : null,
        blackLimiter: this.blackChoice === 'engine' ? {
          enabled: this.blackLimiterEnabled,
          type: this.blackLimiterType,
          value: this.blackLimiterValue
        } : null
      }

      // PvP: both are players
      if (this.whiteChoice === 'player' && this.blackChoice === 'player') {
        this.$emit('start', payload)
        this.close()
        return
      }

      // EvE: both are engines
      if (this.whiteChoice === 'engine' && this.blackChoice === 'engine') {
        this.$emit('start', payload)
        this.close()
        return
      }

      // PvE: one side player, other engine
      const playerIsWhite = (this.whiteChoice === 'player')
      // Dispatch PvEtrue with information about which side is the player
      // (existing behavior; actual logic remains in the store)
      this.$store.dispatch('PvEtrue', { 
        playerIsWhite,
        pveLimiter: playerIsWhite ? payload.blackLimiter : payload.whiteLimiter,
        engine: playerIsWhite ? payload.blackEngine : payload.whiteEngine,
        gameMode: payload.gameMode
       })

      // Emit a start event as well (UI layer hook), then close
      this.$emit('start', payload)
      this.close()
    }
  }
}
</script>

<style scoped>
.modal-overlay {
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

.modal-content {
  background: var(--main-bg-color);
  color: var(--main-text-color);
  width: 820px;
  max-width: calc(100% - 40px);
  height: 80vh;
  max-height: 900px;
  border-radius: 8px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 14px 18px;
  border-bottom: 1px solid var(--main-border-color);
}

.modal-body {
  padding: 12px 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 12px;
  overflow: auto;
  flex: 1 1 auto;
}

.game-mode {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  
}


.side-select {
  display: flex;
  flex-direction: column;
  min-height: 180px;
}

.side-select select,
.game-mode select {
  margin-top: 6px;
  padding: 6px 8px;
  border-radius: 4px;
  background-color: var(--second-bg-color);
  color: var(--main-text-color);
  border: 1px solid var(--main-border-color);
}

.engine-config {
  margin-top: 8px;
  padding: 8px;
  border: 1px solid var(--main-border-color);
  border-radius: 6px;
  background: var(--second-bg-color);
}

.engine-select-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.engine-logo {
  width: 120px;
  height: 60px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 5px;
  background-color: var(--button-color);
  flex-shrink: 0;
}

.engine-select {
  margin-top: 6px;
  flex: 1;
}

.engine-limiter {
  display: flex;
  align-items: center;
  margin-top: 8px;
  font-size: 13px;
}

.limiter-controls {
  margin-top: 8px;
  display: flex;
  gap: 8px;
  align-items: center;
}

.limiter-input {
  width: 120px;
  padding: 6px 8px;
  border-radius: 4px;
  background-color: var(--second-bg-color);
  color: var(--main-text-color);
  border: 1px solid var(--main-border-color);
}

.limiter-unit {
  font-size: 12px;
  color: var(--main-text-color);
  opacity: 0.7;
}

.hint {
  grid-column: 1 / -1;
  margin-top: 6px;
  font-size: 12px;
  color: var(--main-text-color);
  opacity: 0.7;
}

.modal-footer {
  padding: 10px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--main-border-color);
  flex: 0 0 auto;
  gap: 12px;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.disabled-hint {
  font-size: 12px;
  color: var(--main-text-color);
  opacity: 0.6;
  font-style: italic;
}

.start-button {
  background-color: var(--save-btn-color);
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
}

.start-button:hover { background-color: var(--save-btn-hover); cursor: pointer; }

.start-button:disabled {
  background-color: var(--save-btn-color);
  cursor: not-allowed;
  opacity: 0.5;
}

.close-button {
  background-color: var(--cancel-btn-color);
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
}

.close-button:hover { background-color: var(--cancel-btn-hover); cursor: pointer; }
</style>
