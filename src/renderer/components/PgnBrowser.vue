<template>
  <div>
    <div id="gameselect">
      <div
        v-for="game in loadedGames"
        :key="game.id"
      >
        <div
          class="gameoption"
          :class="{active : game == selectedGame}"
          @click="selectedGame = game"
        >
          {{ game ? game.headers("White") : '' }} vs {{ game ? game.headers("Black") : '' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PgnBrowser',
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
  }

}
</script>

<style scoped>
#gameselect {
  overflow-y: auto;
  overflow-x: auto;
  height: 100%
}

.gameoption {
  text-decoration: none;
  display: block;
  border-bottom: 1px solid black;
  font-size: 0.8em;
  font-weight: 600;
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
