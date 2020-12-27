<template>
<div>
  <multiselect class="multiselect" v-model="selected" :options="pieceStyles" :allow-empty="false" :show-labels="false" :placeholder="selected"></multiselect>
</div>
</template>

<script>
import Multiselect from 'vue-multiselect'
import { mapGetters } from 'vuex'

export default {
  name: 'pieceStyleSelector',
  components: {
    Multiselect
  },
  data () {
    return {
      pieceStyles: [
        'california',
        'merida',
      ],
      internationalVariants: [
        'chess'
      ],
      internationalPieces: [
        'alpha',
        'chess7'
      ],
      selected: 'merida'
    }
  },
  computed: {
    ...mapGetters(['variant'])
  },
  watch: {
    selected: function () {
      // e.g. create custom mapping: const pieceStyle = {'alpha': 'alpha', 'tatiana': 'tatiana'};
      console.log(`this.selectedPieceStyle: ${this.selected}`)
      this.$store.dispatch('pieceStyle', this.selected)
    },
    variant () {
      if (this.internationalVariants.includes(this.variant)) {
        this.selected = this.internationalPieces[0]
        this.pieceStyles = []
        this.internationalPieces.forEach(element => {
          this.pieceStyles.push(element)
        });
      }

    }
  }
}
</script>

<style scoped>

</style>
