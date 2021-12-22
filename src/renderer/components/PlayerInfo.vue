<template>
  <div class="playerinfo">
    <i
      slot="extra"
      class="icon mdi"
      :class="[isWhite ? 'mdi-checkbox-blank-circle-outline' : 'mdi-checkbox-blank-circle']"
    />
    <span v-if="playerTitle">[{{ playerTitle }}]</span> {{ name }} <span v-if="elo">({{ elo }})</span>
  </div>
</template>

<script>
export default {
  name: 'PlayerInfo',
  props: {
    playerTitle: {
      type: String,
      default: null
    },
    elo: {
      type: [String, Number],
      default: null
    },
    name: {
      type: String,
      default: 'No name'
    },
    isWhite: {
      type: Boolean,
      default: true
    }
  }

}
</script>
<style scoped>

</style>
