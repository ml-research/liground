<template>
    <div class="playerinfo">
    {{ rank }} {{ name }} {{ elo }}
    </div>
</template>

<script>
export default {
  name: 'PlayerInfo',
  props: {
    rank: {
      type: String,
      default: ''
      },
    elo: {
      type: [String, Number],
      default: '?'
      },
    name: {
      type: String,
      default: 'No name'
      },
    color: String
  },
  computed: {
    colorCode: function () {
      return this.color
    }
  }
    

}
</script>
<style scoped>
.playerinfo {
  background-color: white;
}
</style>