<template>
  <div id="gameinfo">
    <div id="players">
      <player-info name="Maxi Mustermensch" class="player" style="text-align: left"/>
      vs.
      <player-info class="player" style="text-align: right"/>
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
  background-color: white;
  padding: 0.3em;
}
</style>