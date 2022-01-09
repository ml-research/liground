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
<<<<<<< HEAD
=======

>>>>>>> 80d97d5314bf035e105f055d76b744cd66b54cf2
export default {
  name: 'BoardStyleSelector',
  components: {
    Multiselect
  },
  data () {
    return {
      counter: 0,
      shogiCounter: 0,
      janggiCounter: 0,
      xiangqiCounter: 0,
      seaCounter: 0,
      boardStyles: [
<<<<<<< HEAD
        'Add Custom',
=======
        'Add custom',
>>>>>>> 80d97d5314bf035e105f055d76b744cd66b54cf2
        'blue',
        'brown',
        'green',
        'lightgreen',
        'purple'
      ],
      internationalStyles: [
<<<<<<< HEAD
        'Add Custom',
=======
        'Add custom',
>>>>>>> 80d97d5314bf035e105f055d76b744cd66b54cf2
        'blue',
        'brown',
        'green',
        'lightgreen',
        'purple'
      ],
<<<<<<< HEAD
      seaStyles: ['Add Custom', 'orange', 'yellow'],
      shogiStyles: ['Add Custom', 'bluechess', 'traditional'],
      janggiStyles: [
        'Add Custom',
=======
      seaStyles: [
        'Add custom',
        'orange',
        'yellow'
      ],
      shogiStyles: [
        'Add custom',
        'bluechess',
        'traditional'
      ],
      janggiStyles: [
        'Add custom',
>>>>>>> 80d97d5314bf035e105f055d76b744cd66b54cf2
        'brown',
        'dark',
        'darkwood',
        'lightbrown',
        'stone'
      ],
      xiangqiStyles: [
<<<<<<< HEAD
        'Add Custom',
=======
        'Add custom',
>>>>>>> 80d97d5314bf035e105f055d76b744cd66b54cf2
        'dark',
        'lightbrown',
        'orange',
        'riverbanks'
      ]
    }
  },
  computed: {
    ...mapGetters([
      'variant',
      'boardStyle',
      'isInternational',
      'isShogi',
      'isXiangqi',
      'isSEA',
      'isJanggi'
    ]),
    displayStyle () {
      return this.boardStyle
    }
  },
  watch: {
    variant () {
      if (this.isInternational) {
        if (localStorage.internationalBoardStyle) {
          this.$store.dispatch(
            'boardStyle',
            localStorage.internationalBoardStyle
          )
        } else {
          this.updateBoardStyle(this.internationalStyles[1])
        }
        this.boardStyles = []
        let i
        for (i = 0; i < this.counter; i++) {
          const custom = 'custom' + (i + 1)
          this.internationalStyles.push(custom)
          console.log('test')
        }
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
        let i
<<<<<<< HEAD
        for (i = 0; i < this.shogiCounter; i++) {
          const custom = 'customShogi' + (i + 1)
          this.shogiStyles.push(custom)
          console.log('test')
=======
        for (i = 0; i < this.counter; i++) {
          const custom = 'custom' + (i + 1)
          this.internationalStyles.push(custom)
>>>>>>> 80d97d5314bf035e105f055d76b744cd66b54cf2
        }
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
        let i
        for (i = 0; i < this.seaCounter; i++) {
          const custom = 'customSea' + (i + 1)
          this.seaStyles.push(custom)
          console.log('test')
        }
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
        let i
        for (i = 0; i < this.xiangqiCounter; i++) {
          const custom = 'customXiangqi' + (i + 1)
          this.xiangqiStyles.push(custom)
          console.log('test')
        }
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
        let i
        for (i = 0; i < this.janggiCounter; i++) {
          const custom = 'customJanggi' + (i + 1)
          this.janggiStyles.push(custom)
          console.log('test')
        }
        this.janggiStyles.forEach(element => {
          this.boardStyles.push(element)
        })
      }
    }
  },
  methods: {
    preview (name) {
      let board = ''
      if (name === 'Add Custom') {
        board = 'addCustom'
<<<<<<< HEAD
      } else if (this.isInternational) {
        board = name === 'lightgreen' ? 'lightgreen' : `${name}`
=======
      }
      if (this.isInternational) {
        board = name === 'lightgreen' ? 'ic' : `${name}`
>>>>>>> 80d97d5314bf035e105f055d76b744cd66b54cf2
      } else if (this.isShogi) {
        const conv = {
          traditional: 'shogi',
          bluechess: 'shogic',
          customShogi1: 'customShogi1',
          customShogi2: 'customShogi2',
          customShogi3: 'customShogi3',
          customShogi4: 'customShogi4',
          customShogi5: 'customShogi5'
        }
        board = conv[name]
      } else if (this.isSEA) {
        const conv = {
          yellow: 'makruk',
          orange: 'makruk2',
          customSea1: 'customSea1',
          customSea2: 'customSea2',
          customSea3: 'customSea3',
          customSea4: 'customSea4',
          customSea5: 'customSea5'
        }
        board = conv[name]
      } else if (this.isXiangqi) {
        const conv = {
          dark: 'xiangqiDark',
          lightbrown: 'xiangqi',
          orange: 'xiangqiWikimedia',
          riverbanks: 'xiangqic',
          customXiangqi1: 'customXiangqi1',
          customXiangqi2: 'customXiangqi2',
          customXiangqi3: 'customXiangqi3',
          customXiangqi4: 'customXiangqi4',
          customXiangqi5: 'customXiangqi5'
        }
        board = conv[name]
      } else if (this.isJanggi) {
        const conv = {
          brown: 'JanggiBrown',
          dark: 'JanggiDark',
          darkwood: 'JanggiWoodDark',
          lightbrown: 'Janggi',
          stone: 'JanggiStone',
          customJanggi1: 'customJanggi1',
          customJanggi2: 'customJanggi2',
          customJanggi3: 'customJanggi3',
          customJanggi4: 'customJanggi4',
          customJanggi5: 'customJanggi5'
        }
        board = conv[name]
      }
      return `url(static/board/svg/${board}.svg`
    },
<<<<<<< HEAD

    async reWriteSvgs (counter) {
      const svgFile = await this.addCustom(counter)
      if (svgFile === undefined) {
        if (this.isInternational) {
          this.counter--
        } else if (this.isShogi) {
          this.shogiCounter--
        } else if (this.isXiangqi) {
          this.xiangqiCounter--
        } else if (this.isSEA) {
          this.seaCounter--
        } else if (this.isJanggi) {
          this.janggiCounter--
        }
=======
    async reWriteSvgs () {
      const svgFile = await this.addCustom()
      if (svgFile === undefined) {
>>>>>>> 80d97d5314bf035e105f055d76b744cd66b54cf2
        return false
      }
      if (!svgFile.canceled) {
        fs.readFile(svgFile.filePaths[0], 'utf-8', (err, data) => {
          if (err) {
            alert('An error ocurred reading the file :' + err.message)
            return
          }
<<<<<<< HEAD
          let path
          if (this.isInternational) {
            path = 'static/board/svg/custom' + this.counter + '.svg'
          } else if (this.isShogi) {
            path = 'static/board/svg/customShogi' + this.shogiCounter + '.svg'
          } else if (this.isXiangqi) {
            path =
              'static/board/svg/customXiangqi' + this.xiangqiCounter + '.svg'
          } else if (this.isSEA) {
            path = 'static/board/svg/customSea' + this.seaCounter + '.svg'
          } else if (this.isJanggi) {
            path = 'static/board/svg/customJanggi' + this.janggiCounter + '.svg'
          }

          fs.writeFile(path, data, err => {
=======
          const path = 'static/board/svg/custom' + this.counter + '.svg'
          fs.writeFile(path, data, (err) => {
>>>>>>> 80d97d5314bf035e105f055d76b744cd66b54cf2
            if (err) {
              alert('An error ocurred updating the file' + err.message)
              console.log(err)
            }
          })
        })
        return true
      } else if (svgFile.canceled) {
<<<<<<< HEAD
        if (this.isInternational) {
          this.counter--
        } else if (this.isShogi) {
          this.shogiCounter--
        } else if (this.isXiangqi) {
          this.xiangqiCounter--
        } else if (this.isSEA) {
          this.seaCounter--
        } else if (this.isJanggi) {
          this.janggiCounter--
        }
=======
        this.counter--
>>>>>>> 80d97d5314bf035e105f055d76b744cd66b54cf2
        return false
      }
    },
    async updateCustom (counter) {
      const reWritten = await this.reWriteSvgs(counter)
      if (reWritten) {
        setTimeout(() => {
<<<<<<< HEAD
          let boardStyleCustom

          if (this.isInternational) {
            boardStyleCustom = 'custom' + counter
          } else if (this.isShogi) {
            boardStyleCustom = 'customShogi' + counter
          } else if (this.isXiangqi) {
            boardStyleCustom = 'customXiangqi' + counter
          } else if (this.isSEA) {
            boardStyleCustom = 'customSea' + counter
          } else if (this.isJanggi) {
            boardStyleCustom = 'customJanggi' + counter
          }
          this.boardStyles.push(boardStyleCustom)
          if (this.isInternational) {
            localStorage.internationalBoardStyle = boardStyleCustom
          } else if (this.isShogi) {
            localStorage.shogiBoardStyle = boardStyleCustom
          } else if (this.isXiangqi) {
            localStorage.xiangqiBoardStyle = boardStyleCustom
          } else if (this.isSEA) {
            localStorage.seaBoardStyle = boardStyleCustom
          } else if (this.isJanggi) {
            localStorage.janggiBoardStyle = boardStyleCustom
          }
=======
          const boardStyleCustom = 'custom' + counter
          this.boardStyles.push(boardStyleCustom)
          localStorage.internationalBoardStyle = boardStyleCustom
>>>>>>> 80d97d5314bf035e105f055d76b744cd66b54cf2
          this.$store.dispatch('boardStyle', boardStyleCustom)
        }, 50)
      }
    },
<<<<<<< HEAD
    addCustom (counter) {
      if (counter > 5) {
        alert("You can't add more than 5 Custom Designs")
=======
    addCustom () {
      if (this.counter > 5) {
        alert("You can't add more than 5 Custom Designs")
        this.counter--
>>>>>>> 80d97d5314bf035e105f055d76b744cd66b54cf2
        return
      }
      return this.$electron.remote.dialog.showOpenDialog({
        title: 'Choose Custom Board Style',
        properties: ['openFile'],
        filters: [{ name: 'SVG Files', extensions: ['svg'] }]
      })
    },
    updateBoardStyle (payload) {
      if (payload === 'Add Custom') {
<<<<<<< HEAD
        let testCounter = 0

        if (this.isInternational) {
          this.counter++
          testCounter = this.counter
        } else if (this.isShogi) {
          this.shogiCounter++
          testCounter = this.shogiCounter
        } else if (this.isXiangqi) {
          this.xiangqiCounter++
          testCounter = this.xiangqiCounter
        } else if (this.isSEA) {
          this.seaCounter++
          testCounter = this.seaCounter
        } else if (this.isJanggi) {
          this.janggiCounter++
          testCounter = this.janggiCounter
        }
        this.updateCustom(testCounter)
        return
      } else if (this.isInternational) {
        // localStorage for all different groups of board stylings
=======
        this.counter++
        this.updateCustom(this.counter)
        return
      } else if (this.isInternational) { // localStorage for all different groups of board stylings
>>>>>>> 80d97d5314bf035e105f055d76b744cd66b54cf2
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
