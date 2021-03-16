<template>
  <div>
    <Multiselect
      class="multiselect"
      :value="displayPieceStyle"
      :options="pieceStyles"
      :allow-empty="false"
      :show-labels="false"
      @input="updatePieceStyle"
    >
      <template
        slot="option"
        slot-scope="props"
      >
        <div class="item">
          <div class="preview">
            <div
              class="image white"
              :style="{ backgroundImage: preview(props.option)[0] }"
            />
            <div
              class="image black"
              :style="{ backgroundImage: preview(props.option)[1] }"
            />
          </div>
          <span class="name">{{ props.option }}</span>
        </div>
      </template>
      <template
        slot="singleLabel"
        slot-scope="props"
      >
        <div class="item">
          <div class="preview">
            <div
              class="image white"
              :style="{ backgroundImage: preview(props.option)[0] }"
            />
            <div
              class="image black"
              :style="{ backgroundImage: preview(props.option)[1] }"
            />
          </div>
          <span class="name">{{ props.option }}</span>
        </div>
      </template>
    </Multiselect>
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
      } else if (this.isShogi) {
        if (localStorage.shogiPieceStyle) {
          this.$store.dispatch('pieceStyle', localStorage.shogiPieceStyle)
        } else {
          this.updatePieceStyle(this.shogiPieces[0])
        }
        this.pieceStyles = []
        this.shogiPieces.forEach(element => {
          this.pieceStyles.push(element)
        })
      } else if (this.isSEA) {
        if (localStorage.seaPieceStyle) {
          this.$store.dispatch('pieceStyle', localStorage.seaPieceStyle)
        } else {
          this.updatePieceStyle(this.seaPieces[0])
        }
        this.pieceStyles = []
        this.seaPieces.forEach(element => {
          this.pieceStyles.push(element)
        })
      } else if (this.isXiangqi || this.isJanggi) {
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
    preview (name) {
      let pieces = ['', '']
      if (this.isInternational) {
        pieces = [`international/${name}/wN`, `international/${name}/bN`]
      } else if (this.isSEA) {
        switch (name) {
          case 'adarb':
            pieces = ['SouthEastAsian/ada/orig/rN', 'SouthEastAsian/ada/orig/bN']
            break
          case 'adawb':
            pieces = ['SouthEastAsian/ada/orig/wN', 'SouthEastAsian/ada/orig/bN']
            break
          case 'adawr':
            pieces = ['SouthEastAsian/ada/orig/wN', 'SouthEastAsian/ada/orig/rN']
            break
          case 'intl':
            pieces = ['international/merida/wN', 'international/merida/bN']
            break
          default:
            pieces = [`SouthEastAsian/${name}/wN`, `SouthEastAsian/${name}/bN`]
        }
      } else if (this.isShogi) {
        pieces = [`Shogi/${name}/0KE`, `Shogi/${name}/1KE`]
      } else if (this.isXiangqi || this.isJanggi) {
        switch (name) {
          case 'ct2':
            pieces = ['Xiangqi/ct2/red_horse2', 'Xiangqi/ct2/black_horse2']
            break
          case 'hanjablue':
          case 'intlblue':
          case 'intlkakao':
          case 'intlwooden':
          case 'Ka_kakao':
          case 'Ka_wooden':
            pieces = [`Xiangqi/${name}/red_horse`, `Xiangqi/${name}/blue_horse`]
            break
          case 'hanjagreen':
            pieces = ['Xiangqi/hanjablue/red_horse', 'Xiangqi/hanjagreen/blue_horse']
            break
          case 'intlgreen':
            pieces = ['Xiangqi/intlblue/red_horse', 'Xiangqi/intlgreen/blue_horse']
            break
          default:
            pieces = [`Xiangqi/${name}/red_horse`, `Xiangqi/${name}/black_horse`]
        }
      }
      return [`url(static/piece/${pieces[0]}.svg)`, `url(static/piece/${pieces[1]}.svg)`]
    },
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
.item {
  display: flex;
  flex-direction: row;
  font-size: 0.9em;
}
.item .preview {
  margin-top: -8px;
  margin-bottom: -8px;
  margin-left: -4px;
  margin-right: 1ch;
  display: flex;
  flex-direction: row;
  align-items: center;
}
.item .image {
  width: 35px;
  height: 35px;
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
}
.item .image + .image {
  margin-left: 2px;
}
</style>
