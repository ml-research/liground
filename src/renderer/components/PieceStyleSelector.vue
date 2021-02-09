<template>
  <div>
    <Multiselect
      v-model="selected"
      class="multiselect"
      :options="pieceStyles"
      :allow-empty="false"
      :show-labels="false"
      :placeholder="selected"
    />
  </div>
</template>

<script>
import Multiselect from 'vue-multiselect'
import { mapGetters } from 'vuex'

export default {
  name: 'PieceStyleSelector',
  components: {
    Multiselect
  },
  data () {
    return {
      internationalVariants: [
        'chess', 'crazyhouse', 'horde', 'kingofthehill', '3check', 'racingkings', 'antichess'
      ],
      seaVariants: [
        'makruk'
      ],
      xiangqiVariants: [
        'janggi', 'xiangqi'
      ],
      shogiVariants: [
        'shogi'
      ],
      pieceStyles: [
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
      shogiPieces: [
        '2kanji',
        'ctk',
        'ctkw3d',
        'ctm',
        'ctp',
        'ctp3d',
        'ctw',
        'Ka'
      ],
      internationalPieces: [
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
      seaPieces: [
        'adarb',
        'adawb',
        'adawr',
        'cambodian',
        'intl'
      ],
      xiangqiPieces: [
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
      selected: 'merida'
    }
  },
  computed: {
    ...mapGetters(['variant'])
  },
  watch: {
    selected: function () {
      console.log(`this.selectedPieceStyle: ${this.selected}`)
      if (this.internationalVariants.includes(this.variant)) {
        localStorage.internationalPieceStyle = this.selected
      } else if (this.shogiVariants.includes(this.variant)) {
        localStorage.shogiPieceStyle = this.selected
      } else if (this.seaVariants.includes(this.variant)) {
        localStorage.seaPieceStyle = this.selected
      } else if (this.xiangqiVariants.includes(this.variant)) {
        localStorage.xiangqiPieceStyle = this.selected
      }
      this.$store.dispatch('pieceStyle', this.selected)
    },
    variant () {
      if (this.internationalVariants.includes(this.variant)) {
        if (localStorage.internationalPieceStyle) {
          this.selected = localStorage.internationalPieceStyle
        } else {
          this.selected = this.internationalPieces[18]
        }
        this.pieceStyles = []
        this.internationalPieces.forEach(element => {
          this.pieceStyles.push(element)
        })
      }
      if (this.shogiVariants.includes(this.variant)) {
        if (localStorage.shogiPieceStyle) {
          this.selected = localStorage.shogiPieceStyle
        } else {
          this.selected = this.shogiPieces[0]
        }
        this.pieceStyles = []
        this.shogiPieces.forEach(element => {
          this.pieceStyles.push(element)
        })
      }
      if (this.seaVariants.includes(this.variant)) {
        if (localStorage.seaPieceStyle) {
          this.selected = localStorage.seaPieceStyle
        } else {
          this.selected = this.seaPieces[0]
        }
        this.pieceStyles = []
        this.seaPieces.forEach(element => {
          this.pieceStyles.push(element)
        })
      }
      if (this.xiangqiVariants.includes(this.variant)) {
        if (localStorage.xiangqiPieceStyle) {
          this.selected = localStorage.xiangqiPieceStyle
        } else {
          this.selected = this.xiangqiPieces[0]
        }
        this.pieceStyles = []
        this.xiangqiPieces.forEach(element => {
          this.pieceStyles.push(element)
        })
      }
    }
  }
}
</script>

<style scoped>

</style>
