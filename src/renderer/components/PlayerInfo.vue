<template>
    <div class="playerinfo">
    <i slot="extra" class="icon mdi" :class="[isWhite ? 'mdi-checkbox-blank-circle-outline' : 'mdi-checkbox-blank-circle']"/> 
    [{{ playerTitle }}] {{ name }} ({{ elo }})
    </div>
</template>

<script>
export default {
  name: 'PlayerInfo',
  props: {
    playerTitle: {
      type: String,
      default: '?'
      },
    elo: {
      type: [String, Number],
      default: '?'
      },
    name: {
      type: String,
      default: 'No name'
      },
    isWhite: {
      type: Boolean,
      default: true
    }
  },  

}
</script>
<style scoped>

</style>