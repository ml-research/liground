<template>
  <div v-if="visible" class="modal-overlay" @click.self="close">
    <div class="modal-content" role="dialog" aria-modal="true">
      <!-- Modal header -->
      <div class="modal-header">
        <h3>Start New Game</h3>
      </div>

      <!-- Modal body: choose Player or Engine for both sides -->
      <div class="modal-body">
        <div class="side-select">
          <label for="white-select"><b>White</b></label>
          <select id="white-select" v-model="whiteChoice">
            <option value="player">Player</option>
            <option value="engine">Engine</option>
          </select>
        </div>

        <div class="side-select">
          <label for="black-select"><b>Black</b></label>
          <select id="black-select" v-model="blackChoice">
            <option value="player">Player</option>
            <option value="engine">Engine</option>
          </select>
        </div>

        <p class="hint">Choose whether each side should be controlled by a human player or an engine (PvP, PvE, EvE supported).</p>
      </div>

      <!-- Modal footer: Start (left) and Close (right) -->
      <div class="modal-footer">
        <button class="start-button" @click="startGame"><b>Start Game</b></button>
        <button class="close-button" @click="close"><b>Close</b></button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StartGameModal',
  props: {
    // Controls visibility of the modal; parent toggles it.
    visible: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      // Default selections
      whiteChoice: 'player',
      blackChoice: 'engine'
    }
  },
  methods: {
    // Close the modal and emit a close event so parent can update visibility.
    close () {
      this.$emit('close')
    },

    // Emit a start event with the selected roles and close the modal.
    // We differentiate between PvP, PvE and EvE here:
    // - PvP and EvE are TODO for now (no automatic logic implemented yet)
    // - PvE dispatches 'PvEtrue' with payload { playerIsWhite } so the app knows which side the human controls
    startGame () {
      const payload = {
        white: this.whiteChoice,
        black: this.blackChoice
      }

      // PvP: both are players
      if (this.whiteChoice === 'player' && this.blackChoice === 'player') {
        // TODO: implement player vs player setup
        console.log('[StartGame] PvP selected (TODO)')
        this.$emit('start', payload)
        this.close()
        return
      }

      // EvE: both are engines
      if (this.whiteChoice === 'engine' && this.blackChoice === 'engine') {
        // TODO: implement engine vs engine setup
        console.log('[StartGame] EvE selected (TODO)')
        this.$emit('start', payload)
        this.close()
        return
      }

      // PvE: one side player, other engine
      const playerIsWhite = (this.whiteChoice === 'player')
      // Dispatch PvEtrue with information about which side is the player
      // This mirrors PvESwitch but allows the player to be black as well.
      this.$store.dispatch('PvEtrue', { playerIsWhite })

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
  background: var(--card-background, #fff);
  color: var(--text-color, #111);
  width: 420px;
  max-width: calc(100% - 40px);
  border-radius: 8px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.modal-header {
  padding: 14px 18px;
  border-bottom: 1px solid rgba(0,0,0,0.06);
}

.modal-body {
  padding: 16px 18px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 12px;
}

.side-select {
  display: flex;
  flex-direction: column;
}

.side-select select {
  margin-top: 6px;
  padding: 6px 8px;
  border-radius: 4px;
}

.hint {
  grid-column: 1 / -1;
  margin-top: 4px;
  font-size: 12px;
  color: var(--muted-text, #666);
}

.modal-footer {
  padding: 10px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(0,0,0,0.06);
}

.start-button {
  background-color: #28a745; /* green */
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
}

.start-button:hover { background-color: #1f8f3b; cursor: pointer; }

.close-button {
  background-color: #c72634; /* red */
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
}

.close-button:hover { background-color: #8b1919; cursor: pointer; }
</style>
