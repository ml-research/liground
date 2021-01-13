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
        :key="round.name"
      >
        <div
          class="browserelement roundseperator"
          :class="{active : selectedGame && selectedGame.headers('Round') === round.name}"
          @click="round.visible = !round.visible"
        >
          Round {{ round.name }}
          <span
            slot="extra"
            class="icon mdi"
            :class="[round.visible ? 'mdi-menu-up' : 'mdi-menu-down']"
            style="float: right;"
          />
        </div>
        <div v-show="round.visible">
          <div
            v-for="game in loadedGames"
            :key="game.id"
          >
            <div
              v-if="game.headers('Round') === round.name && (filterGameHeader('White', gameFilter, game) || filterGameHeader('Black', gameFilter, game))"
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
  </div>
</template>

<script>
export default {
  name: 'PgnBrowser',
  data: function () {
    return {
      gameFilter: '',
      rounds: []
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
    loadedGames: {
      get: function () {
        return this.$store.getters.loadedGames
      }
    }
  },
  watch: {
    loadedGames: function () {
      if (this.$store.getters.loadedGames) {
        // get distinct rounds
        this.rounds = this.$store.getters.loadedGames.map((value, idx, arr) => {
          return value.headers('Round')
        }).filter((value, idx, arr) => {
          return arr.indexOf(value) === idx
        }).map((value, idx) => {
          return { name: value, visible: idx === 0 }
        })
      }
    }
  },
  methods: {
    filterGameHeader (key, searchString, game) {
      return game.headers(key).toLowerCase().indexOf(searchString.toLowerCase()) !== -1
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

.roundseperator {
  border-top: 2px solid black;
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

.gameoption.active, .roundseperator.active {
  background-color:#444;
  color: white;
}
</style>
