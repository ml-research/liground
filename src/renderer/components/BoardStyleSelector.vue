<template>
  <div>
    <Multiselect
      class="multiselect"
      :value="displayStyle"
      :options="boardStyles"
      :allow-empty="false"
      :show-labels="false"
      @input="updateBoardStyle"
    />
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
      internationalVariants: [
        'chess', 'crazyhouse', 'horde', 'kingofthehill', '3check', 'racingkings', 'antichess'
      ],
      seaVariants: [
        'makruk'
      ],
      xiangqiVariants: [
        'xiangqi'
      ],
      janggiVariants: [
        'janggi'
      ],
      shogiVariants: [
        'shogi'
      ],
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
      ]
    }
  },
  computed: {
    ...mapGetters(['variant', 'boardStyle', 'isInternational', 'isShogi', 'isXiangqi', 'isSEA', 'isJanggi']),
    displayStyle () {
      return this.boardStyle
    }
  },
  watch: {
    variant () {
      if (this.isInternational) {
        if (localStorage.internationalBoardStyle) {
          this.$store.dispatch('boardStyle', localStorage.internationalBoardStyle)
        } else {
          this.updateBoardStyle(this.internationalStyles[0])
        }
        this.boardStyles = []
        this.internationalStyles.forEach(element => {
          this.boardStyles.push(element)
        })
      } else
      if (this.isShogi) {
        if (localStorage.shogiBoardStyle) {
          this.$store.dispatch('boardStyle', localStorage.shogiBoardStyle)
        } else {
          this.updateBoardStyle(this.shogiStyles[1])
        }
        this.boardStyles = []
        this.shogiStyles.forEach(element => {
          this.boardStyles.push(element)
        })
      } else
      if (this.isSEA) {
        if (localStorage.seaBoardStyle) {
          this.$store.dispatch('boardStyle', localStorage.seaBoardStyle)
        } else {
          this.updateBoardStyle(this.seaStyles[1])
        }
        this.boardStyles = []
        this.seaStyles.forEach(element => {
          this.boardStyles.push(element)
        })
      } else
      if (this.isXiangqi) {
        if (localStorage.xiangqiBoardStyle) {
          this.$store.dispatch('boardStyle', localStorage.xiangqiBoardStyle)
        } else {
          this.updateBoardStyle(this.xiangqiStyles[1])
        }
        this.boardStyles = []
        this.xiangqiStyles.forEach(element => {
          this.boardStyles.push(element)
        })
      } else
      if (this.isJanggi) {
        if (localStorage.janggiBoardStyle) {
          this.$store.dispatch('boardStyle', localStorage.janggiBoardStyle)
        } else {
          this.updateBoardStyle(this.janggiStyles[3])
        }
        this.boardStyles = []
        this.janggiStyles.forEach(element => {
          this.boardStyles.push(element)
        })
      }
    }
  },
  methods: {
    updateBoardStyle (payload) {
      if (this.isInternational) { // localStorage for all different groups of board stylings
        localStorage.internationalBoardStyle = payload
      } else if (this.isShogi) {
        localStorage.shogiBoardStyle = payload
      } else if (this.isSEA) {
        localStorage.seaBoardStyle = payload
      } else if (this.isXiangqi) {
        localStorage.xiangqiBoardStyle = payload
      } else if (this.isJanggi) {
        localStorage.janggiBoardStyle = payload
      }
      this.$store.dispatch('boardStyle', payload)
    }
  }

}
</script>
<style scoped>

</style>
