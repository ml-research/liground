<template>
  <div>
    <multiselect
      v-model="selected"
      class="multiselect"
      :options="variants"
      :allow-empty="false"
      :show-labels="false"
      :placeholder="selected"
    />
  </div>
</template>

<script>
import Multiselect from 'vue-multiselect'

export default {
  name: 'PieceStyleSelector',
  components: {
    Multiselect
  },
  data () {
    return {
      variants: [
        'alpha',
        'california',
        'cardinal',
        'cburnett',
        'chess7',
        'chessnut',
        'companion',
        'dubrovny',
        'fantasy',
        'fresca',
        'gioco',
        'governor',
        'icpieces',
        'kosal',
        'leipzig',
        'letter',
        'libra',
        'maestro',
        'merida',
        'pirouetti',
        'pixel',
        'reillycraig',
        'riohacha',
        'shapes',
        'spatial',
        'staunty',
        'tatiana'
      ],
      selected: 'merida'
    }
  },
  watch: {
    selected: function () {
      // e.g. create custom mapping: const pieceStyle = {'alpha': 'alpha', 'tatiana': 'tatiana'};
      console.log(`this.selectedPieceStyle: ${this.selected}`)
      this.$store.dispatch('pieceStyle', this.selected)
    }
  }
}
</script>

<style scoped>

</style>
