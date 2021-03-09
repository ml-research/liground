<template>
  <div>
    <Multiselect
      v-model="selected"
      class="multiselect"
      :options="pieceStyles"
      :allow-empty="false"
      :show-labels="false"
      placeholder="Piece Style"
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
    selected () {
      this.$store.dispatch('pieceStyle', this.selected)
    },
    variant () {
      // TODO: we could add getters like `isInternational()` to the store
      if (this.internationalVariants.includes(this.variant)) {
        this.selected = this.internationalPieces[18]
        this.pieceStyles = []
        this.internationalPieces.forEach(element => {
          this.pieceStyles.push(element)
        })
      } else if (this.shogiVariants.includes(this.variant)) {
        this.selected = this.shogiPieces[0]
        this.pieceStyles = []
        this.shogiPieces.forEach(element => {
          this.pieceStyles.push(element)
        })
      } else if (this.seaVariants.includes(this.variant)) {
        this.selected = this.seaPieces[0]
        this.pieceStyles = []
        this.seaPieces.forEach(element => {
          this.pieceStyles.push(element)
        })
      } else if (this.xiangqiVariants.includes(this.variant)) {
        this.selected = this.xiangqiPieces[0]
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
      if (this.internationalVariants.includes(this.variant)) {
        pieces = [`international/${name}/wN`, `international/${name}/bN`]
      } else if (this.seaVariants.includes(this.variant)) {
        switch (name) {
          case 'adarb':
            pieces = ['southeastasian/ada/orig/rN', 'southeastasian/ada/orig/bN']
            break
          case 'adawb':
            pieces = ['southeastasian/ada/orig/wN', 'southeastasian/ada/orig/bN']
            break
          case 'adawr':
            pieces = ['southeastasian/ada/orig/wN', 'southeastasian/ada/orig/rN']
            break
          case 'intl':
            pieces = ['international/merida/wN', 'international/merida/bN']
            break
          default:
            pieces = [`southeastasian/${name}/wN`, `southeastasian/${name}/bN`]
        }
      } else if (this.shogiVariants.includes(this.variant)) {
        pieces = [`shogi/${name}/0KE`, `shogi/${name}/1KE`]
      } else if (this.xiangqiVariants.includes(this.variant)) {
        switch (name) {
          case 'ct2':
            pieces = ['xiangqi/ct2/red_horse2', 'xiangqi/ct2/black_horse2']
            break
          case 'hanjablue':
          case 'intlblue':
          case 'intlkakao':
          case 'intlwooden':
          case 'Ka_kakao':
          case 'Ka_wooden':
            pieces = [`xiangqi/${name}/red_horse`, `xiangqi/${name}/blue_horse`]
            break
          case 'hanjagreen':
            pieces = ['xiangqi/hanjablue/red_horse', 'xiangqi/hanjagreen/blue_horse']
            break
          case 'intlgreen':
            pieces = ['xiangqi/intlblue/red_horse', 'xiangqi/intlgreen/blue_horse']
            break
          default:
            pieces = [`xiangqi/${name}/red_horse`, `xiangqi/${name}/black_horse`]
        }
      }
      return [`url(static/piece/${pieces[0]}.svg)`, `url(static/piece/${pieces[1]}.svg)`]
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
  margin: -8px 4px -8px -4px;
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
