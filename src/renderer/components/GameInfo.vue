<template>
  <div id="gameinfo">
    <div id="players">
      <PlayerInfo
        :name="whiteName"
        :elo="whiteElo"
        :player-title="whiteTitle"
        :is-white="true"
        class="player"
        style="text-align: left"
      />
      vs.
      <PlayerInfo
        :name="blackName"
        :elo="blackElo"
        :player-title="blackTitle"
        :is-white="false"
        class="player"
        style="text-align: right"
      />
      <div
        class="collapsible"
        @click="toggle"
      >
        <em
          v-show="showExpandIcon"
          class="icon mdi mdi-arrow-expand-down"
        />
        <em
          v-show="showMinimizeIcon"
          class="icon mdi mdi-arrow-expand-up"
        />
      </div>
    </div>
    <div
      v-show="showSection"
      id="metainfo"
    >
      <p>
        Event: {{ eventName ? eventName : 'unknown' }} <span v-if="eventSite"> (@ {{ eventSite }})</span>
        <span v-if="round && /\d+/gm.test(round)"> round {{ round }} </span>
        <span v-if="date">on {{ date }}</span>
      </p>
      <p>Result: {{ result ? result : 'unknown' }}</p>
      <p>Annotator: {{ annotator ? annotator : 'unknown' }}</p>
    </div>
  </div>
</template>

<script>
import PlayerInfo from './PlayerInfo.vue'
export default {
  name: 'GameInfo',
  components: { PlayerInfo },
  data () {
    return {
      showSection: false, // Flag to show MetaInfo
      showExpandIcon: true, // Flag to show expand-down icon
      showMinimizeIcon: false // Flag to show expand-up icon
    }
  },
  computed: {
    gameInfo () {
      return this.$store.getters.gameInfo
    },
    whiteName () {
      return this.gameInfo.White
    },
    blackName () {
      return this.gameInfo.Black
    },
    whiteElo () {
      return this.gameInfo.WhiteElo
    },
    blackElo () {
      return this.gameInfo.BlackElo
    },
    whiteTitle () {
      return this.gameInfo.WhiteTitle
    },
    blackTitle () {
      return this.gameInfo.BlackTitle
    },
    eventName () {
      return this.gameInfo.Event
    },
    eventSite () {
      return this.gameInfo.Site
    },
    date () {
      if (this.gameInfo.Date) {
        const parts = this.gameInfo.Date.split('.').map((curVal) => { return parseInt(curVal) })

        if (parts.length === 3 && !parts.includes(NaN)) {
          const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]))

          // const options = { timezone: 'UTC' }
          return d.toLocaleDateString()
        }
      }
      return null
    },
    annotator () {
      return this.gameInfo.Annotator
    },
    result () {
      return this.gameInfo.Result
    },
    round () {
      return this.gameInfo.Round
    }
  },
  methods: {
    toggle () { // Flips Flags
      this.showSection = !this.showSection
      this.showExpandIcon = !this.showExpandIcon
      this.showMinimizeIcon = !this.showMinimizeIcon
    }
  }
}
</script>
<style scoped>

.player {
  flex: 50%;
}

#players {
  display: flex;
  border-bottom: 1px solid var(--main-border-color);
}

#metainfo {
  font-size: 10pt;
  font-weight: 200;
  text-align: left;
}

.collapsible {
  color: var(--light-text-color);
  background-color: var(--button-color);
  padding: 1px;
  border: 2px solid var(--main-border-color);
  text-decoration: none;
  cursor: pointer;
  width: 20px;
  border: none;
  text-align: center;
  outline: none;
  font-size: 12px;
  text-align: center;
}

.active, .collapsible:hover {
  background-color: var(--hover-color);
}
</style>
