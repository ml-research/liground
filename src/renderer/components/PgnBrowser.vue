<template>
  <div>
    <div id="gameselect">
      <input
        id="groupcheckbox"
        v-model="groupByRound"
        type="checkbox"
      >
      <label
        id="groupbyround"
        for="groupcheckbox"
      >Group by rounds?</label>
      <div class="search">
        <input
          id="gamefilter"
          v-model="gameFilter"
          type="text"
          name="gamefilter"
          placeholder="filter games"
        >
        <span
          slot="extra"
          class="icon mdi mdi-magnify"
        />
      </div>
      <template v-if="groupByRound">
        <div
          v-for="round in rounds"
          :key="`${round.name} ${round.eventName}`"
        >
          <div
            class="browserelement roundseperator"
            :class="{ active : selectedGame && selectedGame.headers('Round') === round.name && selectedGame.headers('Event') === round.eventName }"
            :title="round.eventName"
            @click="round.visible = !round.visible"
          >
            Round {{ round.name }} <span style="font-size: 0.65em"> ({{ round.eventName.substring(0, 15) }}...) </span>
            <span
              slot="extra"
              class="icon mdi"
              :class="[round.visible || gameFilter !== '' ? 'mdi-menu-up' : 'mdi-menu-down']"
              style="float: right;"
            />
          </div>
          <div v-show="round.visible || gameFilter !== ''">
            <div
              v-for="game in loadedGames"
              :key="game.id"
            >
              <div
                v-if="game.headers('Round') === round.name && game.headers('Event') === round.eventName && (filterGameHeader('White', gameFilter, game) || filterGameHeader('Black', gameFilter, game))"
                class="browserelement gameoption"
                :class="{ active : game === selectedGame }"
                @click="selectedGame = game"
              >
                {{ game ? game.headers("White") : 'unknown' }} <br> vs {{ game ? game.headers("Black") : 'unknown' }}
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div
          v-for="game in loadedGames"
          :key="game.id"
        >
          <div
            v-if="(filterGameHeader('White', gameFilter, game) || filterGameHeader('Black', gameFilter, game))"
            class="browserelement gameoption"
            :class="{ active : game === selectedGame }"
            @click="selectedGame = game"
          >
            {{ game ? game.headers("White") : 'unknown' }} <br> vs {{ game ? game.headers("Black") : 'unknown' }}
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PgnBrowser',
  data: function () {
    return {
      gameFilter: '',
      rounds: [],
      groupByRound: true
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
        if (this.$store.getters.loadedGames.length <= 1) {
          this.groupByRound = false
        }
        // get distinct rounds
        this.rounds = this.$store.getters.loadedGames.map((value, idx, arr) => {
          return `${value.headers('Round')} ${value.headers('Event')}`
        // distinct
        }).filter((value, idx, arr) => {
          return arr.indexOf(value) === idx
        // add visibility attribute for dropdown
        }).map((value, idx) => {
          const firstSpace = value.indexOf(' ')
          const round = value.substring(0, firstSpace)
          const event = value.substring(firstSpace + 1)
          return { name: round, eventName: event, visible: idx === 0 }
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

#groupbyround {
  font-size: 0.75em;
}

#gamefilter {
  max-width: 80%;
  background-color: var(--second-bg-color);
  color: var(--main-text-color);
}

.roundseperator {
  border-top: 2px solid var(--main-border-color);
}

.browserelement {
  text-decoration: none;
  display: block;
  border-bottom: 1px solid var(--main-border-color);
  font-size: 0.75em;
  font-weight: 600;
  text-align: left;
}

.gameoption:hover, .roundseperator:hover {
  background-color: #2196F3;
  color: white;
  cursor: pointer;
}

.gameoption.active, .roundseperator.active {
  background-color:#444;
  color: white;
}

.icon.mdi-magnify {
  padding: 0px 6px;
  margin: 0px 1px;
  border-radius: 3px;
  float: right;
  background-color: #34495e;
  color: white;
}

.icon.mdi-magnify:hover {
  background-color: #22303d;
  cursor: pointer;
}

.search {
  padding: 2px 0px;
}
</style>
