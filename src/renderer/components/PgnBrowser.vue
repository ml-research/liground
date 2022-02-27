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
          id="icon"
          slot="extra"
          class="icon mdi mdi-magnify"
        />
        <i
          id="icon"
          class="icon mdi mdi-filter-menu-outline"
          @click="openContextMenu()"
        />
        <i
          id="icon"
          class="icon mdi mdi-plus-box-outline"
          @click="openAddPgnModal()"
        />
      </div>
      <div>
        <AddPgnModal
          v-if="AddPgnModal.visible"
          :title="AddPgnModal.title"
          @close="AddPgnModal.visible = false"
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
    <div
      class="footer"
      @click="removeSafedPGN"
    >
      <em class="icon mdi mdi-trash-can-outline" />
    </div>
  </div>
</template>

<script>
import { remote } from 'electron'
import { mapGetters } from 'vuex'
import { bus } from '../main'
import AddPgnModal from './AddPgnModal'

export default {
  name: 'PgnBrowser',
  components: { AddPgnModal },
  data: function () {
    return {
      AddPgnModal: {
        visible: false,
        title: ''
      },
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
    },
    openAddPgnModal () {
      this.AddPgnModal = {
        visible: true,
        title: 'Add new PGN'
      }
    },
    removeSafedPGN () {
      if (confirm('Do you really want to remove the safed PGNs and reset the board?')) {
        document.dispatchEvent(new Event('resetPlot'))
        this.$store.dispatch('resetBoard', { is960: false }) // used to exit 960 Mode
      }
      if (this.$store.getters.loadedGames) {
        const games = []
        this.$store.dispatch('loadedGames', games)
      }
    }
  }
}
</script>

<style scoped>
#gameselect {
  overflow-y: auto;
  overflow-x: auto;
  height: 95%;
  border: 0px solid var(--main-border-color);
}

.optionlabel {
  font-size: 0.75em;
}

#gamefilter {
  max-width: 55%;
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

.icon {
  color: white;
  cursor: pointer;
}

.icon:hover {
  background-color: var(--hover-color);
  border-radius: 8px;
  cursor: pointer;
}

.search {
  background-color: var(--button-color);
  border-bottom: 1px solid var(--main-border-color);
  padding: 2px 2px;
  white-space: nowrap;
  width: 100%;
}

.footer {
  border-top: 1px solid var(--main-border-color);
  background-color: var(--button-color);
  height: 5%;
}
.footer:hover {
  background-color: var(--hover-color);
}
.icon.mdi-trash-can-outline {
  font-size: 100%;

}

.unsupported {
  background-color: #999;
  color: #555;
  cursor: not-allowed;
}
</style>
