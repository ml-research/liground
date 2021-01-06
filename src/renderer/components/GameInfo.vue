<template>
  <div id="gameinfo">
    <div id="players">
      <player-info
        :name="whiteName"
        :elo="whiteElo"
        :player-title="whiteTitle"
        :is-white="true"
        class="player"
        style="text-align: left"
      />
      vs.
      <player-info
        :name="blackName"
        :elo="blackElo"
        :player-title="blackTitle"
        :is-white="false"
        class="player"
        style="text-align: right"
      />
    </div>
    <div id="metainfo">
      <p>Event: {{ eventName ? eventName : 'unknown' }} <span v-if="eventSite"> (@ {{ eventSite }})</span> <span v-if="round && /\d+/gm.test(round)">round {{ round }} </span> <span v-if="date">on {{ date }}</span></p>
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
  }

}
</script>
<style scoped>

.player {
  flex: 50%;
}

#players {
  display: flex;
  border-bottom: 1px solid rgb(192, 192, 192);
}

#gameinfo {
  padding: 0.3em;
}

#metainfo {
  font-size: 10pt;
  font-weight: 200;
  text-align: left;
}
</style>
