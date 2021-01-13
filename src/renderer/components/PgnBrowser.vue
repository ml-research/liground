<template>
  <div>
    <div id="gameselect">
      <input
        id="gamefilter"
        v-model.lazy="gameFilter"
        type="text"
        name="gamefilter"
        placeholder="filter games"
      >
      <div
        v-for="round in rounds"
        :key="round"
      >
        <div class="browserelement">
          Round {{ round }}
        </div>
        <div
          v-for="game in loadedGames.filter(filterGameHeader('Round', round))"
          :key="game.id"
        >
          <div
            class="browserelement gameoption"
            :class="{active : game == selectedGame}"
            @click="selectedGame = game"
          >
            {{ game ? game.headers("White") : 'unknown' }} vs {{ game ? game.headers("Black") : 'unknown' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PgnBrowser',
  data: function () {
    return {
      gameFilter: ''
    }
  },
  computed: {
    selectedGame: {
      get: function () {
        return this.$store.getters.selectedGame
      },
      set: function (newVal) {
        this.$store.dispatch('loadGame', { game: newVal })
      }
    },
    rounds: {
      get: function () {
        if (this.$store.getters.loadedGames) {
          // get distinct rounds
          const rounds = this.$store.getters.loadedGames.map((value, idx, arr) => {
            return value.headers('Round')
          }).filter((value, idx, arr) => {
            return arr.indexOf(value) === idx
          })

          return rounds
        }
        return undefined
      }
    },
    loadedGames: {
      get: function () {
        if (this.$store.getters.loadedGames) {
          return this.$store.getters.loadedGames.filter((game) => {
            return this.filterGameHeader('White', this.gameFilter)(game) || this.filterGameHeader('Black', this.gameFilter)(game)
          })
        } else {
          return this.$store.getters.loadedGames
        }
      }
    }
  },
  watch: {
    gameFilter: function (foo, bar) {
      console.log('gameFilter change')
    }
  },
  methods: {
    filterGameHeader (key, searchString) {
      return function (game) {
        return game.headers(key).toLowerCase().indexOf(searchString.toLowerCase()) !== -1
      }
    }
  }

}
</script>

<style scoped>
#gameselect {
  overflow-y: auto;
  overflow-x: auto;
  height: 100%
}

#gamefilter {
  width: 100%;
}

.browserelement {
  text-decoration: none;
  display: block;
  border-bottom: 1px solid black;
  font-size: 0.8em;
  font-weight: 600;
  text-align: left;
}

.gameoption:hover {
  background-color: #2196F3;
  color: white;
  cursor: pointer;
}

.gameoption.active {
  background-color:#444;
  color: white;
}
</style>
