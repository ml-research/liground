<template>
  <div class="saveGameModal">
    <div
      class="backdrop"
      @click="cancel"
    />
    <div class="contents">
      <header class="header">
        {{ title }}
      </header>
      <div class="body">
        <div class="inputGroup">
          <label for="gameName">Game Name:</label>
          <input
            id="gameName"
            v-model="gameName"
            type="text"
            placeholder="e.g., My Game"
            autofocus
            @keyup.enter="save"
          >
        </div>
        <div class="inputGroup">
          <label for="eventName">Event:</label>
          <input
            id="eventName"
            v-model="eventName"
            type="text"
            placeholder="e.g., Casual Game"
          >
        </div>
        <div class="inputGroup">
          <label for="siteName">Site:</label>
          <input
            id="siteName"
            v-model="siteName"
            type="text"
            placeholder="e.g., Home"
          >
        </div>
        <div class="inputGroup">
          <label for="roundName">Round:</label>
          <input
            id="roundName"
            v-model="roundName"
            type="text"
            placeholder="e.g., 1"
          >
        </div>
        <div class="inputGroup">
          <label for="whiteName">White Player:</label>
          <input
            id="whiteName"
            v-model="whiteName"
            type="text"
            placeholder="e.g., Player 1"
          >
        </div>
        <div class="inputGroup">
          <label for="blackName">Black Player:</label>
          <input
            id="blackName"
            v-model="blackName"
            type="text"
            placeholder="e.g., Player 2"
          >
        </div>
        <div class="infoText">
          <p>Current FEN: <code>{{ currentFen }}</code></p>
        </div>
      </div>
      <footer class="footer">
        <button
          type="button"
          class="btn green"
          @click="save"
        >
          save
        </button>
        <button
          type="button"
          class="btn red"
          @click="cancel"
        >
          cancel
        </button>
      </footer>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ffish from 'ffish'

export default {
  name: 'SaveGameModal',
  props: {
    title: {
      required: true,
      type: String
    }
  },
  data () {
    return {
      gameName: '',
      eventName: '',
      siteName: '',
      roundName: '',
      whiteName: '',
      blackName: ''
    }
  },
  computed: {
    ...mapGetters(['fen', 'moves', 'startFen', 'variant', 'gameInfo']),
    currentFen () {
      return this.fen
    }
  },
  mounted () {
    // gotta look into this again later dosen't seem to work
    // Ensure the input field is focused when modal opens
    this.$nextTick(() => {
      const input = document.getElementById('gameName')
      if (input) {
        input.focus()
      }
    })
  },
  methods: {
    cancel () {
      this.$emit('close')
    },
    async save () {
      if (this.gameName.trim() === '') {
        alert('Please enter a game name')
        return
      }

      // Create PGN string from current game state
      const pgn = this.generatePGN()

      // Parse the PGN using ffish
      try {
        const game = ffish.readGamePGN(pgn)

        // Get existing games
        let games = []
        if (this.$store.getters.loadedGames) {
          games = this.$store.getters.loadedGames
        }

        // Assign new id to the game
        game.id = games.length
        game.supported = true

        // Add the game to the list
        games.push(game)

        // Update store
        this.$store.dispatch('loadedGames', games)

        // Ask user if they want to save to file
        const saveToFile = confirm('Do you want to save this game to a file on your computer?')
        if (saveToFile) {
          await this.saveToFile(pgn)
        } else {
          this.$emit('close')
          alert(`Game "${this.gameName}" saved successfully!`)
        }
      } catch (error) {
        console.error('Error saving game:', error)
        alert('Error saving game: ' + error.message)
      }
    },
    async saveToFile (pgn) {
      const { ipcRenderer } = require('electron')
      
      try {
        // Show save dialog
        const result = await ipcRenderer.invoke('show-save-dialog', {
          title: 'Save Game',
          defaultPath: `${this.gameName}.pgn`,
          filters: [
            { name: 'PGN Files', extensions: ['pgn'] },
            { name: 'All Files', extensions: ['*'] }
          ]
        })

        if (result.canceled) {
          // User canceled, just close the modal
          this.$emit('close')
          alert(`Game "${this.gameName}" saved to library!`)
          return
        }

        // Write the file
        const writeResult = await ipcRenderer.invoke('write-file', result.filePath, pgn)
        
        if (writeResult.success) {
          // Add the file path to the saved games list
          await ipcRenderer.invoke('add-game-path', result.filePath)
          
          this.$emit('close')
          alert(`Game "${this.gameName}" saved successfully to:\n${result.filePath}`)
        } else {
          alert(`Error writing file: ${writeResult.error}`)
        }
      } catch (error) {
        console.error('Error in saveToFile:', error)
        alert('Error saving file: ' + error.message)
      }
    },
    generatePGN () {
      // Build the header section
      let pgn = ''

      // Add headers - use user input if provided, otherwise fall back to gameInfo or default
      pgn += `[Event "${this.eventName || this.gameInfo.Event || 'My Game'}"]\n`
      pgn += `[Site "${this.siteName || this.gameInfo.Site || '?'}"]\n`
      pgn += `[Date "${this.gameInfo.Date || new Date().toISOString().split('T')[0]}"]\n`
      pgn += `[Round "${this.roundName || this.gameInfo.Round || '?'}"]\n`
      pgn += `[White "${this.whiteName || this.gameInfo.White || 'Player1'}"]\n`
      pgn += `[Black "${this.blackName || this.gameInfo.Black || 'Player2'}"]\n`
      pgn += `[Result "${this.gameInfo.Result || '*'}"]\n`

      // Add custom title
      pgn += `[WhiteTitle "${this.gameName}"]\n`

      // Add variant if not standard chess
      if (this.variant && this.variant !== 'chess') {
        pgn += `[Variant "${this.variant}"]\n`
      }

      // Add FEN if it's not the starting position
      if (this.startFen && this.startFen !== 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1') {
        pgn += `[FEN "${this.startFen}"]\n`
      }

      pgn += '\n'

      // Add moves in SAN notation
      const movesText = this.generateMovesSAN()
      pgn += movesText

      return pgn
    },
    generateMovesSAN () {
      // Convert moves to SAN notation with move numbers
      if (!this.moves || this.moves.length === 0) {
        return '*'
      }

      let san = ''
      let moveNumber = 1

      // Start from the beginning
      for (let i = 0; i < this.moves.length; i++) {
        const move = this.moves[i]

        // Add move number for white moves
        if (i % 2 === 0) {
          san += moveNumber + '. '
        }

        // Add the move in SAN notation (name field contains SAN)
        if (move.name) {
          san += move.name + ' '
        } else if (move.uci) {
          san += move.uci + ' '
        }

        // Increment move number after black's move
        if (i % 2 === 1) {
          moveNumber++
        }
      }

      return san + '*'
    }
  }
}
</script>

<style scoped>
.saveGameModal {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.backdrop {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.3);
  cursor: pointer;
}

.contents {
  position: relative;
  background-color: var(--second-bg-color);
  border: 2px solid var(--main-border-color);
  border-radius: 8px;
  width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.header {
  padding: 16px;
  border-bottom: 2px solid var(--main-border-color);
  font-size: 16px;
  font-weight: bold;
  color: var(--main-text-color);
}

.body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.inputGroup {
  margin-bottom: 16px;
}

.inputGroup label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--main-text-color);
  font-size: 14px;
}

.inputGroup input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--main-border-color);
  border-radius: 4px;
  background-color: var(--button-color);
  color: white;
  font-size: 14px;
  box-sizing: border-box;
}

.inputGroup input:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 4px rgba(33, 150, 243, 0.5);
}

.inputGroup input::placeholder {
  color: var(--light-text-color);
  opacity: 0.5;
}

.infoText {
  background-color: var(--button-color);
  padding: 12px;
  border-radius: 4px;
  border: 1px solid var(--main-border-color);
  font-size: 12px;
  color: var(--light-text-color);
}

.infoText p {
  margin: 0;
  word-break: break-all;
}

.infoText code {
  background-color: var(--second-bg-color);
  padding: 2px 4px;
  border-radius: 2px;
  color: var(--main-text-color);
  font-family: monospace;
  font-size: 11px;
}

.footer {
  padding: 16px;
  border-top: 2px solid var(--main-border-color);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn.green {
  background-color: #4CAF50;
  color: white;
}

.btn.green:hover {
  background-color: #45a049;
}

.btn.red {
  background-color: #f44336;
  color: white;
}

.btn.red:hover {
  background-color: #da190b;
}
</style>
