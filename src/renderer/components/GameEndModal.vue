<template>
  <div v-if="visible" class="modal-overlay" @click.self="close">
    <div class="modal-content" role="dialog" aria-modal="true">
      <div class="modal-header">
        <h3>Game Over</h3>
      </div>

      <div class="modal-body">
        <div class="result-messages">
          <div v-if="result === 'draw'" class="draw-result">
            <p class="draw-text">The game ended in a draw between <strong>{{ whiteLabel }}</strong> and <strong>{{ blackLabel }}</strong>.</p>
          </div>
          <div v-else class="win-loss-result">
            <p v-if="result === 'white-win'" class="win-text"><strong>{{ whiteLabel }}</strong> has won the game.</p>
            <p v-else class="win-text"><strong>{{ blackLabel }}</strong> has won the game.</p>
            
            <p v-if="result === 'white-win'" class="loss-text"><strong>{{ blackLabel }}</strong> has lost the game.</p>
            <p v-else class="loss-text"><strong>{{ whiteLabel }}</strong> has lost the game.</p>
          </div>
        </div>

        <div v-if="hasStats" class="game-stats">
          <h4>Game Statistics</h4>
          <table class="stats-table">
            <tr v-if="stats.whiteAccuracy !== null">
              <td><strong>{{ whiteLabel }} Accuracy</strong></td>
              <td>{{ stats.whiteAccuracy }}%</td>
            </tr>
            <tr v-if="stats.blackAccuracy !== null">
              <td><strong>{{ blackLabel }} Accuracy</strong></td>
              <td>{{ stats.blackAccuracy }}%</td>
            </tr>
            <tr v-if="stats.moveCount !== null">
              <td><strong>Total Moves</strong></td>
              <td>{{ stats.moveCount }}</td>
            </tr>
            <tr v-if="stats.gameLength !== null">
              <td><strong>Game Length</strong></td>
              <td>{{ stats.gameLength }}</td>
            </tr>
          </table>
        </div>
      </div>

      <div class="modal-footer">
        <button class="close-button" @click="close"><b>Close</b></button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GameEndModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    // Game configuration from StartGameModal
    gameConfig: {
      type: Object,
      default: () => ({})
    },
    // Game stats computed from board state
    stats: {
      type: Object,
      default: () => ({
        whiteAccuracy: null,
        blackAccuracy: null,
        moveCount: null,
        gameLength: null
      })
    }
  },
  computed: {
    result () {
      return this.$store.state.gameResult
    },
    whiteLabel () {
      const config = this.gameConfig
      if (config.white === 'player') {
        return 'Player White'
      } else if (config.white === 'engine' && config.whiteEngine) {
        return `Engine White [${config.whiteEngine}]`
      }
      return 'White'
    },
    blackLabel () {
      const config = this.gameConfig
      if (config.black === 'player') {
        return 'Player Black'
      } else if (config.black === 'engine' && config.blackEngine) {
        return `Engine Black [${config.blackEngine}]`
      }
      return 'Black'
    },
    hasStats () {
      const s = this.stats
      return s.whiteAccuracy !== null || s.blackAccuracy !== null || s.moveCount !== null || s.gameLength !== null
    }
  },
  methods: {
    close () {
      this.$emit('close')
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
  width: 500px;
  max-width: calc(100% - 40px);
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

.modal-header h3 {
  margin: 0;
  font-size: 1.3em;
}

.modal-body {
  padding: 16px 18px;
  flex: 1;
  overflow: auto;
}

.result-messages {
  margin-bottom: 16px;
}

.draw-result .draw-text {
  font-size: 1.1em;
  line-height: 1.5;
  margin: 0;
  color: var(--main-text-color);
}

.win-loss-result {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.win-text {
  font-size: 1.1em;
  font-weight: 500;
  color: #28a745;
  margin: 0;
  line-height: 1.4;
}

.loss-text {
  font-size: 1.1em;
  font-weight: 500;
  color: #dc3545;
  margin: 0;
  line-height: 1.4;
}

.game-stats {
  border: 1px solid var(--main-border-color);
  border-radius: 6px;
  padding: 12px;
  background: var(--second-bg-color);
}

.game-stats h4 {
  margin: 0 0 10px 0;
  font-size: 0.95em;
  color: var(--main-text-color);
  opacity: 0.8;
}

.stats-table {
  width: 100%;
  font-size: 0.9em;
  border-collapse: collapse;
}

.stats-table tr {
  border-bottom: 1px solid var(--main-border-color);
  opacity: 0.8;
}

.stats-table tr:last-child {
  border-bottom: none;
}

.stats-table td {
  padding: 6px 0;
}

.stats-table td:first-child {
  text-align: left;
  padding-right: 12px;
}

.stats-table td:last-child {
  text-align: right;
}

.modal-footer {
  padding: 10px 12px;
  display: flex;
  justify-content: center;
  border-top: 1px solid var(--main-border-color);
}

.close-button {
  background-color: var(--cancel-btn-color);
  color: white;
  border: none;
  padding: 8px 24px;
  border-radius: 6px;
  cursor: pointer;
}

.close-button:hover {
  background-color: var(--cancel-btn-hover);
}
</style>
