<template>
  <div>
    <select
      id="gameselector"
      v-model="selectedGame"
      size="10"
      name="gameselector"
    >
      <option
        v-for="game in loadedGames"
        :key="game.id"
        :value="game"
      >
        {{ game.headers('White') }} vs. <br> {{ game.headers('Black') }}
      </option>
    </select>
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
#gameselector {
  width: 100%;
  height: 100%;
}
</style>
