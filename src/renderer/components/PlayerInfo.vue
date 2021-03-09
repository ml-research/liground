<template>
  <div class="playerinfo">
    <template v-if="isWhite">
      <CheckboxBlankCircleOutline />
    </template>
    <template v-else>
      <CheckboxBlankCircle />
    </template>
    [{{ playerTitle }}] {{ name }} ({{ elo }})
  </div>
</template>

<script>

import CheckboxBlankCircleOutline from 'vue-material-design-icons/CheckboxBlankCircleOutline.vue'
import CheckboxBlankCircle from 'vue-material-design-icons/CheckboxBlankCircle.vue'

export default {
  name: 'PlayerInfo',
  components: {
    CheckboxBlankCircleOutline, CheckboxBlankCircle
  },
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
  }

}
</script>
<style scoped>

</style>
