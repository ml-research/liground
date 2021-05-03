<template>
  <div>
    <div id="gameselect">
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
        <i
          class="icon mdi mdi-cog-outline"
          @click="openContextMenu()"
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
                v-if="game.headers('Round') === round.name && game.headers('Event') === round.eventName && isGameVisible(game)"
                class="browserelement gameoption"
                :class="{ active : game === selectedGame, unsupported: !game.supported }"
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
            v-if="isGameVisible(game)"
            class="browserelement gameoption"
            :class="{ active : game === selectedGame, unsupported: !game.supported }"
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
import { remote } from 'electron'
import { mapGetters } from 'vuex'
import { bus } from '../main'

export default {
  name: 'PgnBrowser',
  data: function () {
    return {
      gameFilter: '',
      rounds: [],
      groupByRound: true,
      displayUnsupported: false,
      menu: undefined,
      contextMenuEvents: undefined
    }
  },
  computed: {
    selectedGame: {
      get: function () {
        return this.$store.getters.selectedGame
      },
      set: function (newVal) {
        if (newVal.supported) {
          this.$store.dispatch('loadGame', { game: newVal })
        }
      }
    },
    loadedGames: {
      get: function () {
        return this.$store.getters.loadedGames
      }
    },
    ...mapGetters(['variantOptions'])
  },
  watch: {
    loadedGames: function () {
      if (this.$store.getters.loadedGames) {
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

        this.$store.dispatch('rounds', this.rounds)
      }
    }
  },
  created: function () {
    bus.$on('toggleGroup', (newVal) => {
      this.groupByRound = newVal
    })

    bus.$on('toggleUnsupported', (newVal) => {
      this.displayUnsupported = newVal
    })

    bus.$on('openAllRounds', () => this.setVisibilityOfAllRounds(true))

    bus.$on('collapseAllRounds', () => this.setVisibilityOfAllRounds(false))

    const menuTemplate = [
      {
        label: 'Group by rounds',
        type: 'checkbox',
        checked: this.groupByRound,
        click: function (item, browserWindow, event) {
          bus.$emit('toggleGroup', item.checked)
        }
      },
      {
        label: 'Display unsupported',
        type: 'checkbox',
        checked: this.displayUnsupported,
        click: function (item, browserWindow, event) {
          bus.$emit('toggleUnsupported', item.checked)
        }
      },
      {
        label: 'Open all rounds',
        type: 'normal',
        click: function () {
          bus.$emit('openAllRounds')
        }
      },
      {
        label: 'Collapse all rounds',
        type: 'normal',
        click: function () {
          bus.$emit('collapseAllRounds')
        }
      }
    ]

    this.menu = remote.Menu.buildFromTemplate(menuTemplate)
  },
  methods: {
    isGameVisible (game) {
      if ((game.headers('White').toLowerCase().indexOf(this.gameFilter.toLowerCase()) !== -1 ||
        game.headers('Black').toLowerCase().indexOf(this.gameFilter.toLowerCase()) !== -1) &&
        (this.displayUnsupported || game.supported)) {
        return true
      } else {
        return false
      }
    },
    openContextMenu () {
      this.menu.popup(remote.getCurrentWindow())
    },
    setVisibilityOfAllRounds (value) {
      this.rounds.forEach(round => {
        round.visible = value
      })
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

.optionlabel {
  font-size: 0.75em;
}

#gamefilter {
  max-width: 65%;
  background-color: var(--second-bg-color);
  color: var(--main-text-color);
}
#gamefilter::placeholder {
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

.gameoption:hover:not(.unsupported), .roundseperator:hover {
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
  border-radius: 5px;
  background-color: var(--button-color);
  box-shadow: 1px 1px 1px 1px black;
  color: white;
}

.icon.mdi-magnify:hover {
  background-color: #22303d;
  cursor: pointer;
}

.icon.mdi-cog-outline:hover {
  cursor: pointer;
}

.search {
  padding: 5px 0px;
  white-space: nowrap;
  width: 100%;
}

.unsupported {
  background-color: #999;
  color: #555;
  cursor: not-allowed;
}
</style>
