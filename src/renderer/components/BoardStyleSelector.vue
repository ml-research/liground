<template>
  <div>
    <Multiselect
      v-model="selected"
      class="multiselect"
      :options="boardStyles"
      :allow-empty="false"
      :show-labels="false"
      :placeholder="selected"
    >
      <template
        slot="option"
        slot-scope="props"
      >
        <div class="item">
          <div class="preview">
            <div
              class="image"
              :style="{ backgroundImage: preview(props.option) }"
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
              class="image"
              :style="{ backgroundImage: preview(props.option) }"
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
  name: 'BoardStyleSelector',
  components: {
    Multiselect
  },
  data () {
    return {
      boardStyles: [
        'blue',
        'brown',
        'green',
        'lightgreen',
        'purple'
      ],
      internationalStyles: [
        'blue',
        'brown',
        'green',
        'lightgreen',
        'purple'
      ],
      seaStyles: [
        'orange',
        'yellow'
      ],
      shogiStyles: [
        'bluechess',
        'traditional'
      ],
      janggiStyles: [
        'brown',
        'dark',
        'darkwood',
        'lightbrown',
        'stone'
      ],
      xiangqiStyles: [
        'dark',
        'lightbrown',
        'orange',
        'riverbanks'
      ],
      selected: 'blue'
    }
  },
  computed: {
    ...mapGetters(['variant', 'isInternational', 'isSEA', 'isXiangqi', 'isJanggi', 'isShogi'])
  },
  watch: {
    selected () {
      this.$store.dispatch('boardStyle', this.selected)
    },
    variant () {
      if (this.isInternational) {
        this.selected = this.internationalStyles[0]
        this.boardStyles = []
        this.internationalStyles.forEach(element => {
          this.boardStyles.push(element)
        })
      } else if (this.isShogi) {
        this.selected = this.shogiStyles[1]
        this.boardStyles = []
        this.shogiStyles.forEach(element => {
          this.boardStyles.push(element)
        })
      } else if (this.isSEA) {
        this.selected = this.seaStyles[1]
        this.boardStyles = []
        this.seaStyles.forEach(element => {
          this.boardStyles.push(element)
        })
      } else if (this.isXiangqi) {
        this.selected = this.xiangqiStyles[1]
        this.boardStyles = []
        this.xiangqiStyles.forEach(element => {
          this.boardStyles.push(element)
        })
      } else if (this.isJanggi) {
        this.selected = this.janggiStyles[3]
        this.boardStyles = []
        this.janggiStyles.forEach(element => {
          this.boardStyles.push(element)
        })
      }
    }
  },
  methods: {
    preview (name) {
      let board = ''
      if (this.isInternational) {
        board = name === 'lightgreen' ? 'ic' : `${name}`
      } else if (this.isShogi) {
        const conv = {
          traditional: 'shogi',
          bluechess: 'shogic'
        }
        board = conv[name]
      } else if (this.isSEA) {
        const conv = {
          yellow: 'makruk',
          bluechess: 'makruk2'
        }
        board = conv[name]
      } else if (this.isXiangqi) {
        const conv = {
          dark: 'xiangqiDark',
          lightbrown: 'xiangqi',
          orange: 'xiangqiWikimedia',
          riverbanks: 'xiangqic'
        }
        board = conv[name]
      } else if (this.isJanggi) {
        const conv = {
          brown: 'JanggiBrown',
          dark: 'JanggiDark',
          darkwood: 'JanggiWoodDark',
          lightbrown: 'Janggi',
          stone: 'JanggiStone'
        }
        board = conv[name]
      }
      return `url(static/board/svg/${board}.svg`
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
.item .preview .image {
  width: 35px;
  height: 35px;
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
}
</style>
