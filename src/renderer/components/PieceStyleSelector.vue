<template>
<div>
  <multiselect class="multiselect" v-model="selected" :options="activeStyles" :allow-empty="false" :show-labels="false" :placeholder="selected"></multiselect>
</div>
</template>

<script>
import Multiselect from 'vue-multiselect'

export default {
  name: 'pieceStyleSelector',
  components: {
    Multiselect
  },
  data () {
    return {
      styles: {
        'chess': this.stylesInternational, 'crazyhouse': this.stylesInternational, 'kingofthehill': this.stylesInternational, '3check': this.stylesInternational, 'antichess': this.stylesInternational, 'horde': this.stylesInternational, 'racingkings': this.stylesInternational, 'shogi': this.stylesShogi, 'janggi': this.stylesXiangqi, 'xiangqi': this.stylesXiangqi, 'makruk': this.stylesSEA
      },
      stylesInternational: [
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
      stylesFairy: [
        'blue',
        'red',
        'white'
      ],
      stylesSEA: [
        'ada',
        'cambodian',
        'intl'
      ],
      stylesXiangqi: [
        'ct2',
        'ct2w',
        'ct3',
        'euro',
        'hanjablue',
        'hanjagreen',
        'hnz',
        'hnzw',
        'intlblue',
        'intlgreen',
        'intlkakao',
        'intlwooden',
        'Ka',
        'Ka_kakao',
        'Ka_wooden',
        'playok'
      ],
      stylesShogi: [
        '2kanji',
        'ctk',
        'ctkw3d',
        'ctm',
        'ctp',
        'ctp3d',
        'ctw',
        'Ka'
      ],
      selected: 'merida',
      activeStyles: this.stylesInternational
    }
  },
  computed: {
    variant () {
      return this.$store.getters.variant
    }
  },
  watch: {
   
    selected: function() {
      // e.g. create custom mapping: const pieceStyle = {'alpha': 'alpha', 'tatiana': 'tatiana'};
      console.log(`this.selectedPieceStyle: ${this.selected}`)
      this.$store.dispatch('pieceStyle', this.selected)
    },
     variant () {
      this.activeStyles = this.styles[this.variant]
    }
  }
}
</script>

<style scoped>

</style>
