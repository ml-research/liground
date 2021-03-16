<template>
  <div>
    <Multiselect
      class="multiselect"
      :value="displayPieceStyle"
      :options="pieceStyles"
      :allow-empty="false"
      :show-labels="false"
      @input="updatePieceStyle"
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
      ]
    }
  },
  computed: {
    ...mapGetters(['variant', 'pieceStyle', 'isInternational', 'isShogi', 'isXiangqi', 'isSEA', 'isJanggi']),
    displayPieceStyle () {
      return this.pieceStyle
    }
  },
  watch: {
    variant () {
      if (this.isInternational) {
        if (localStorage.internationalPieceStyle) {
          this.$store.dispatch('pieceStyle', localStorage.internationalPieceStyle)
        } else {
          this.updatePieceStyle(this.internationalPieces[18])
        }
        this.pieceStyles = []
        this.internationalPieces.forEach(element => {
          this.pieceStyles.push(element)
        })
      }
      if (this.isShogi) {
        if (localStorage.shogiPieceStyle) {
          this.$store.dispatch('pieceStyle', localStorage.shogiPieceStyle)
        } else {
          this.updatePieceStyle(this.shogiPieces[0])
        }
        this.pieceStyles = []
        this.shogiPieces.forEach(element => {
          this.pieceStyles.push(element)
        })
      }
      if (this.isSEA) {
        if (localStorage.seaPieceStyle) {
          this.$store.dispatch('pieceStyle', localStorage.seaPieceStyle)
        } else {
          this.updatePieceStyle(this.seaPieces[0])
        }
        this.pieceStyles = []
        this.seaPieces.forEach(element => {
          this.pieceStyles.push(element)
        })
      }
      if (this.isXiangqi || this.isJanggi) {
        if (localStorage.xiangqiPieceStyle) {
          this.$store.dispatch('pieceStyle', localStorage.xiangqiPieceStyle)
        } else {
          this.updatePieceStyle(this.xiangqiPieces[0])
        }
        this.pieceStyles = []
        this.xiangqiPieces.forEach(element => {
          this.pieceStyles.push(element)
        })
      }
    }
  },
  methods: {
    updatePieceStyle (payload) {
      if (this.isInternational) {
        localStorage.internationalPieceStyle = payload
      } else if (this.isShogi) {
        localStorage.shogiPieceStyle = payload
      } else if (this.isSEA) {
        localStorage.seaPieceStyle = payload
      } else if (this.isXiangqi || this.isJanggi) {
        localStorage.xiangqiPieceStyle = payload
      }
      this.$store.dispatch('pieceStyle', payload)
    }
  }
}
</script>

<style scoped>

</style>
