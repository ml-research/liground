<template>
  <div>
    <div
      class="board960"
      data-text="Input any number and press Enter or click the button for a random Board."
    >
      960 Board:
    </div>
    <div class="input960">
      <input
        id="in"
        class="inputField"
        type="number"
        :value="curVar"
        @change="updateBoard"
      >
    </div>
    <button
      class="button"
      @click="randBoard"
    >
      <span class="icon mdi mdi-dice-6-outline" />
    </button>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  name: 'Mode960',
  components: {},
  data () {
    return {
      curVar: '',
      fen: '',
      variants: ['chess', 'crazyhouse', 'kingofthehill', '3check', 'antichess', 'atomic', 'horde']
    }
  },
  computed: {
    curVar960Fen () {
      return this.$store.getters.curVar960Fen
    },
    variant () {
      return this.$store.getters.variant
    },
    ...mapGetters(['variant'])
  },
  watch: {
    variant () {
      document.getElementById('in').value = ''
      this.$store.commit('newBoard')
    },
    curVar960Fen () {
      if (this.$store.getters.curVar960Fen === '') {
        this.curVar = ''
      }
    }
  },
  methods: {
    randBoard () {
      if (this.variants.includes(this.variant)) {
        const rand = Math.floor(960 * Math.random())
        this.curVar = rand
        if (this.variant === 'horde') {
          this.fen = this.c960_arrangement(rand).toLowerCase() + '/pppppppp/8/1PP2PP1/PPPPPPPP/PPPPPPPP/PPPPPPPP/PPPPPPPP w kq - 0 1'
        } else {
          this.fen = this.c960_fen(rand)
        }
        this.$store.dispatch('curVar960Fen', this.fen)
        this.$store.dispatch('set960', { fen: this.fen, is960: true })
      } else {
        alert('This variant does not support 960 mode')
      }
    },
    updateBoard (event) {
      if (this.variants.includes(this.variant)) {
        this.curVar = event.target.value
        if (this.variant === 'horde') {
          this.fen = this.c960_arrangement(this.curVar).toLowerCase() + '/pppppppp/8/1PP2PP1/PPPPPPPP/PPPPPPPP/PPPPPPPP/PPPPPPPP w kq - 0 1'
        } else {
          this.fen = this.c960_fen(this.curVar)
        }
        this.$store.dispatch('curVar960Fen', this.fen)
        this.$store.dispatch('set960', { fen: this.fen, is960: true })
      } else {
        alert('This variant does not support 960 mode')
      }
    },
    // 960 methods taken from https://github.com/fohristiwhirl/nibbler/blob/master/src/43_chess960.js (GPL3.0)
    c960_arrangement (n) {
      // Given n, generate a string like "RNBQKBNR".
      // AFAIK, matches the scheme of Reinhard Scharnagl.

      if (n < 0) {
        n *= -1
      }
      n = Math.floor(n) % 960
      this.curVar = n

      const pieces = ['.', '.', '.', '.', '.', '.', '.', '.']

      // Helper function to place a piece at an "index",
      // but considering only empty spots.

      const insert = (i, piece) => {
        for (let n = 0; n < 8; n++) {
          if (pieces[n] === '.' && --i < 0) { // Careful! Remember short-circuit rules etc.
            pieces[n] = piece
            return
          }
        }
      }

      // Place bishops in final positions...

      pieces[(Math.floor(n / 4) % 4) * 2] = 'B'
      pieces[(n % 4) * 2 + 1] = 'B'

      // Place queen in one of 6 remaining spots...

      const qi = Math.floor(n / 16) % 6
      insert(qi, 'Q')

      // Knights are arranged in one of 10 possible configurations
      // (considering only the remaining spots)...

      const ni1 = [0, 0, 0, 0, 1, 1, 1, 2, 2, 3][Math.floor(n / 96)]
      const ni2 = [1, 2, 3, 4, 2, 3, 4, 3, 4, 4][Math.floor(n / 96)]

      insert(ni2, 'N') // Must be done in this order,
      insert(ni1, 'N') // works because ni2 > ni1

      // Place left rook, king, right rook in first available spots...

      insert(0, 'R')
      insert(0, 'K')
      insert(0, 'R')

      return pieces.join('')
    },
    c960_fen (n) {
      // Given n, produce a full FEN.

      const pieces = this.c960_arrangement(n) // The uppercase version.

      const s = `${pieces.toLowerCase()}/pppppppp/8/8/8/8/PPPPPPPP/${pieces}`

      let castlingRights = ''

      for (let i = 0; i < 8; i++) {
        if (pieces[i] === 'R') {
          castlingRights += String.fromCharCode(i + 65)
        }
      }

      castlingRights += castlingRights.toLowerCase()

      return `${s} w ${castlingRights} - 0 1`
    }
  }
}
</script>

<style scoped>
/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type=number] {
  -moz-appearance: textfield;
}
.input960 {
  position: relative;
  display: inline-block;
  width: 50px;
}
.inputField {
  width: 50px;
  background-color: var(--second-bg-color);
  color: var(--main-text-color);
}
.button {
  color: white;
  background-color:var(--button-color);
  box-shadow: 1px 1px 1px 1px black;
  border-radius: 5px;
  outline: none;
  font-size: 25px;
}
.button:hover {
  background-color: var(--hover-color);
  cursor: pointer;
}
.board960 {
  display: inline-block;
  position: relative;
}
.board960::before{
  content: attr(data-text);
  position: absolute;
  top: 120%;
  font-size: 12px;
  background-color: var(--tooltip-color);
  color:var(--main-text-color);
  box-shadow:  5px 5px 10px 2px black;
  border-radius: 5px;
  z-index: 2;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease-in-out;
}
.board960::after{
  content: "";
  position: absolute;
  z-index: 2;
  top: 120%;
  margin-top: -20px;
  left: 50%;
  transform: translateX(-50%);
  border: 10px solid #000;
  border-color: transparent transparent var(--tooltip-color) transparent ;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease-in-out;
}
.board960:hover::before,
.board960:hover::after {
  opacity: 1;
  visibility: visible;
  transition-delay: 150ms;
}
</style>
