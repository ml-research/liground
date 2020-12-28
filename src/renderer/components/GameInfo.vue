<template>
  <div id="gameinfo">
    <div id="players">
      <player-info :name="whiteName" :elo="whiteElo" :playerTitle="whiteTitle" :isWhite="true" class="player" style="text-align: left"/>
      vs.
      <player-info :name="blackName" :elo="blackElo" :playerTitle="blackTitle" :isWhite="false" class="player" style="text-align: right"/>
    </div>
    <div class="metaInfo">
      played on 
    </div>
  </div>
</template>

<script>
import PlayerInfo from './PlayerInfo.vue'
export default {
  components: { PlayerInfo },
  name: 'GameInfo',
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
}

#gameinfo {
  padding: 0.3em;
}
</style>