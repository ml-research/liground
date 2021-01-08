<template>
  <div>
    <div id="gameselect">
      <pgn-browser-option
        v-for="game in loadedGames"
        :key="game.id"
        :game="game"
      />
    </div>
  </div>
</template>

<script>
import PgnBrowserOption from './PgnBrowserOption.vue'
export default {
  name: 'PgnBrowser',
  components: { PgnBrowserOption },
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

#gameselect a {
  text-decoration: none;
  display: block;

}
</style>
