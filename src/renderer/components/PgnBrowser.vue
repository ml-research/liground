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
        v-for="game in loadedGames"
        :key="game.id"
      >
        <div
          class="gameoption"
          :class="{active : game == selectedGame}"
          @click="selectedGame = game"
        >
          {{ game ? game.headers("White") : 'unknown' }} vs {{ game ? game.headers("Black") : 'unknown' }}
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
    loadedGames: {
      get: function () {
        if (this.gameFilter === '' || !this.$store.getters.loadedGames) {
          return this.$store.getters.loadedGames
        } else {
          return this.$store.getters.loadedGames.filter((value, idx, arr) => {
            for (const key of value.headerKeys().split(' ')) {
              if (value.headers(key).toLowerCase().indexOf(this.gameFilter.toLowerCase()) !== -1) {
                return true
              }
            }
            return false
          })
        }
      }
    }
  },
  watch: {
    gameFilter: function (foo, bar) {
      console.log('gameFilter change')
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

.gameoption {
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
