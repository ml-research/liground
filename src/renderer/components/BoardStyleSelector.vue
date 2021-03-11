<template>
  <div>
    <Multiselect
      v-model="selected"
      class="multiselect"
      :options="boardStyles"
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
      ],
      selected: 'blue'
    }
  },
  computed: {
    ...mapGetters(['variant', 'boardStyle'])
  },
  watch: {
    boardStyle: function () {
      if (this.selected !== this.boardStyle) this.selected = this.boardStyle
    },
    selected: function () {
      if (this.internationalVariants.includes(this.variant)) { // localStorage for all different groups of board stylings
        localStorage.internationalBoardStyle = this.selected
      } else if (this.shogiVariants.includes(this.variant)) {
        localStorage.shogiBoardStyle = this.selected
      } else if (this.seaVariants.includes(this.variant)) {
        localStorage.seaBoardStyle = this.selected
      } else if (this.xiangqiVariants.includes(this.variant)) {
        localStorage.xiangqiBoardStyle = this.selected
      } else if (this.janggiVariants.includes(this.variant)) {
        localStorage.janggiBoardStyle = this.selected
      }
      this.$store.dispatch('boardStyle', this.selected)
    },
    variant () {
      if (this.internationalVariants.includes(this.variant)) {
        if (localStorage.internationalBoardStyle) {
          this.selected = localStorage.internationalBoardStyle
        } else {
          this.selected = this.internationalStyles[0]
        }
        this.boardStyles = []
        this.internationalStyles.forEach(element => {
          this.boardStyles.push(element)
        })
      } else
      if (this.shogiVariants.includes(this.variant)) {
        if (localStorage.shogiBoardStyle) {
          this.selected = localStorage.shogiBoardStyle
        } else {
          this.selected = this.shogiStyles[1]
        }
        this.boardStyles = []
        this.shogiStyles.forEach(element => {
          this.boardStyles.push(element)
        })
      } else
      if (this.seaVariants.includes(this.variant)) {
        if (localStorage.seaBoardStyle) {
          this.selected = localStorage.seaBoardStyle
        } else {
          this.selected = this.seaStyles[1]
        }
        this.boardStyles = []
        this.seaStyles.forEach(element => {
          this.boardStyles.push(element)
        })
      } else
      if (this.xiangqiVariants.includes(this.variant)) {
        if (localStorage.xiangqiBoardStyle) {
          this.selected = localStorage.xiangqiBoardStyle
        } else {
          this.selected = this.xiangqiStyles[1]
        }
        this.boardStyles = []
        this.xiangqiStyles.forEach(element => {
          this.boardStyles.push(element)
        })
      } else
      if (this.janggiVariants.includes(this.variant)) {
        if (localStorage.janggiBoardStyle) {
          this.selected = localStorage.janggiBoardStyle
        } else {
          this.selected = this.janggiStyles[3]
        }
        this.boardStyles = []
        this.janggiStyles.forEach(element => {
          this.boardStyles.push(element)
        })
      }
    }
  }
}
</script>
<style scoped>

</style>
