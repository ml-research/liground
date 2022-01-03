<template>
  <div>
    
    <Multiselect
      class="multiselect"
      :value="displayStyle"
      :options="boardStyles"
      :allow-empty="false"
      :show-labels="false"
     
      @input="updateBoardStyle"
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
import fs from 'fs'

export default {
  name: 'BoardStyleSelector',
  components: {
    Multiselect
  },
  data () {
    return {
      boardStyles: [
        '+ Add Custom',
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
      } else if (this.isShogi) {
        if (localStorage.shogiBoardStyle) {
          this.$store.dispatch('boardStyle', localStorage.shogiBoardStyle)
        } else {
          this.updateBoardStyle(this.shogiStyles[1])
        }
        this.boardStyles = []
        this.shogiStyles.forEach(element => {
          this.boardStyles.push(element)
        })
      } else if (this.isSEA) {
        if (localStorage.seaBoardStyle) {
          this.$store.dispatch('boardStyle', localStorage.seaBoardStyle)
        } else {
          this.updateBoardStyle(this.seaStyles[1])
        }
        this.boardStyles = []
        this.seaStyles.forEach(element => {
          this.boardStyles.push(element)
        })
      } else if (this.isXiangqi) {
        if (localStorage.xiangqiBoardStyle) {
          this.$store.dispatch('boardStyle', localStorage.xiangqiBoardStyle)
        } else {
          this.updateBoardStyle(this.xiangqiStyles[1])
        }
        this.boardStyles = []
        this.xiangqiStyles.forEach(element => {
          this.boardStyles.push(element)
        })
      } else if (this.isJanggi) {
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
    preview (name) {
      let board = ''
      if (this.isInternational) {
        board = name === 'lightgreen' ? 'lightgreen' : `${name}`
      } else if (this.isShogi) {
        const conv = {
          traditional: 'shogi',
          bluechess: 'shogic'
        }
        board = conv[name]
      } else if (this.isSEA) {
        const conv = {
          yellow: 'makruk',
          orange: 'makruk2'
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
    },
    
    addCustom(payload){
       console.log("bin da")
        this.$electron.remote.dialog.showOpenDialog({
        title: 'Choose Custom Board Style',
        properties: ['openFile'],
        filters: [
          { name: 'SVG Files', extensions: ['svg'] },
          
        ]
      }).then(result => {
        
        if(!result.canceled){
       fs.readFile(result, 'utf-8', (err, data) => {
         if(err){
            alert("An error ocurred reading the file :" + err.message);
            return;
       }

        this.internationalBoardStyle = result[0]
       this.$store.dispatch('boardStyle', result[0]))}
        }}
       
       
    },
    updateBoardStyle (payload) {
      if(payload == '+ Add Custom'){
       this.addCustom(payload);
        return;
      }
        else if (this.isInternational) { // localStorage for all different groups of board stylings
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
