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
          <span
            class="name"
          >
            {{ props.option }}
            <button
              v-if="
                props.option !== 'Add Custom' &&
                  // dont show remove button of standard designs
                  props.option !== 'blue' &&
                  props.option !== 'brown' &&
                  props.option !== 'green' &&
                  props.option !== 'lightgreen' &&
                  props.option !== 'purple' &&
                  // dont show remove button of standard makruk designs
                  props.option !== 'yellow' &&
                  props.option !== 'orange' &&
                  // dont show remove button of standard Janggi and Xiangqi designs
                  props.option !== 'dark' &&
                  props.option !== 'darkwood' &&
                  props.option !== 'lightbrown' &&
                  props.option !== 'stone' &&
                  props.option !== 'riverbanks' &&
                  // dont show remove button of standard shogi designs
                  props.option !== 'bluechess' &&
                  props.option !== 'traditional'
              "
              id="DeleteButton"
              @click="deleteCustom(props.option)"
            >
              Remove
            </button></span>
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
import absolutePath from 'path'
export default {
  name: 'BoardStyleSelector',
  components: {
    Multiselect
  },
  data () {
    return {
      freeCustomID: 1,
      maxCustomStandardCounter: 0,
      overWriteSVGStandardcounter: 0,

      overWriteSVGshogiCounter: 0,
      maxCustomShogiCounter: 0,

      overWriteSVGjanggiCounter: 0,
      maxCustomJanggiCounter: 0,

      overWriteSVGxiangqiCounter: 0,
      maxCustomXiangqiCounter: 0,

      overWriteSVGseaCounter: 0,
      maxCustomSeaCounter: 0,

      map: new Map([
        [1, true],
        [2, true],
        [3, true],
        [4, true],
        [5, true]
      ]),
      shogiMap: new Map([
        [1, true],
        [2, true],
        [3, true],
        [4, true],
        [5, true]
      ]),
      xiangqiMap: new Map([
        [1, true],
        [2, true],
        [3, true],
        [4, true],
        [5, true]
      ]),
      janggiMap: new Map([
        [1, true],
        [2, true],
        [3, true],
        [4, true],
        [5, true]
      ]),
      seaMap: new Map([
        [1, true],
        [2, true],
        [3, true],
        [4, true],
        [5, true]
      ]),

      boardStyles: [
        'Add Custom',
        'blue',
        'brown',
        'green',
        'lightgreen',
        'purple'
      ],
      internationalStyles: [
        'Add Custom',
        'blue',
        'brown',
        'green',
        'lightgreen',
        'purple'
      ],
      seaStyles: ['Add Custom', 'orange', 'yellow'],
      shogiStyles: ['Add Custom', 'bluechess', 'traditional'],
      janggiStyles: [
        'Add Custom',
        'brown',
        'dark',
        'darkwood',
        'lightbrown',
        'stone'
      ],
      xiangqiStyles: [
        'Add Custom',
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

        this.internationalStyles.forEach(element => {
          this.boardStyles.push(element)
        })

        this.map.forEach((value, key) => {
          if (value === false) {
            const custom = 'custom' + (key + 1)
            this.boardStyles.push(custom)
          }
        })
      } else if (this.isShogi) {
        if (localStorage.shogiBoardStyle) {
          this.$store.dispatch('boardStyle', localStorage.shogiBoardStyle)
        } else {
          this.updateBoardStyle(this.shogiStyles[1])
        }
        this.boardStyles = []

        this.shogiMap.forEach((value, key) => {
          if (value === false) {
            const custom = 'custom' + (key + 1)
            this.shogiStyles.push(custom)
          }
        })
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
        this.seaMap.forEach((value, key) => {
          if (value === false) {
            const custom = 'custom' + (key + 1)
            this.seaStyles.push(custom)
          }
        })
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
        this.xiangqiMap.forEach((value, key) => {
          if (value === false) {
            const custom = 'custom' + (key + 1)
            this.xiangqiStyles.push(custom)
          }
        })
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
        this.janggiMap.forEach((value, key) => {
          if (value === false) {
            const custom = 'custom' + (key + 1)
            this.janggiStyles.push(custom)
          }
        })
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
      } else if (this.isInternational) {
        board = name === 'lightgreen' ? 'lightgreen' : `${name}`
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
      return `url(../../../../static/board/svg/${board}.svg`
    },
    async reWriteSvgs (counter) {
      const svgFile = await this.addCustom(counter)
      if (svgFile === undefined) {
        if (this.isInternational) {
          this.maxCustomStandardCounter--
        } else if (this.isShogi) {
          this.maxCustomShogiCounter--
        } else if (this.isXiangqi) {
          this.maxCustomXiangqiCounter--
        } else if (this.isSEA) {
          this.maxCustomSeaCounter--
        } else if (this.isJanggi) {
          this.maxCustomJanggiCounter--
        }
        return false
      }
      if (!svgFile.canceled) {
        fs.readFile(svgFile.filePaths[0], 'utf-8', (err, data) => {
          if (err) {
            alert('An error ocurred reading the file :' + err.message)
            return
          }
          let path
          if (this.isInternational) {
            let bool = false
            this.map.forEach((value, key) => {
              if (bool === false) {
                if (value === true) {
                  bool = true
                  this.freeCustomID = key
                  console.log(this.freeCustomID)
                }
              }
            })
            if (navigator.platform.toUpperCase().indexOf('WIN') > -1 || process.env.NODE_ENV === 'development') {
              path = 'static/board/svg/custom' + this.freeCustomID + '.svg'
            } else if ((navigator.platform.toUpperCase().indexOf('MAC') > -1 || navigator.platform.toUpperCase().indexOf('LINUX') > -1) && process.env.NODE_ENV !== 'development') {
              path = absolutePath.join(__static, '../../../../../static/board/svg/custom' + this.freeCustomID + '.svg')
            }
          } else if (this.isShogi) {
            let bool = false
            this.shogiMap.forEach((value, key) => {
              if (bool === false) {
                if (value === true) {
                  bool = true
                  this.freeCustomID = key
                  console.log(this.freeCustomID)
                }
              }
            })
            if (navigator.platform.toUpperCase().indexOf('WIN') > -1 || process.env.NODE_ENV === 'development') {
              path = 'static/board/svg/customShogi' + this.freeCustomID + '.svg'
            } else if ((navigator.platform.toUpperCase().indexOf('MAC') > -1 || navigator.platform.toUpperCase().indexOf('LINUX') > -1) && process.env.NODE_ENV !== 'development') {
              path = absolutePath.join(__static, '../../../../../static/board/svg/customShogi' + this.freeCustomID + '.svg')
            }
          } else if (this.isXiangqi) {
            let bool = false
            this.xiangqiMap.forEach((value, key) => {
              if (bool === false) {
                if (value === true) {
                  bool = true
                  this.freeCustomID = key
                  console.log(this.freeCustomID)
                }
              }
            })
            if (navigator.platform.toUpperCase().indexOf('WIN') > -1 || process.env.NODE_ENV === 'development') {
              path = 'static/board/svg/customXiangji' + this.freeCustomID + '.svg'
            } else if ((navigator.platform.toUpperCase().indexOf('MAC') > -1 || navigator.platform.toUpperCase().indexOf('LINUX') > -1) && process.env.NODE_ENV !== 'development') {
              path = absolutePath.join(__static, '../../../../../static/board/svg/customXiangji' + this.freeCustomID + '.svg')
            }
          } else if (this.isSEA) {
            let bool = false
            this.seaMap.forEach((value, key) => {
              if (bool === false) {
                if (value === true) {
                  bool = true
                  this.freeCustomID = key
                  console.log(this.freeCustomID)
                }
              }
            })
            if (navigator.platform.toUpperCase().indexOf('WIN') > -1 || process.env.NODE_ENV === 'development') {
              path = 'static/board/svg/customSea' + this.freeCustomID + '.svg'
            } else if ((navigator.platform.toUpperCase().indexOf('MAC') > -1 || navigator.platform.toUpperCase().indexOf('LINUX') > -1) && process.env.NODE_ENV !== 'development') {
              path = absolutePath.join(__static, '../../../../../static/board/svg/customSea' + this.freeCustomID + '.svg')
            }
          } else if (this.isJanggi) {
            let bool = false
            this.janggiMap.forEach((value, key) => {
              if (bool === false) {
                if (value === true) {
                  bool = true
                  this.freeCustomID = key
                  console.log(this.freeCustomID)
                }
              }
            })
            if (navigator.platform.toUpperCase().indexOf('WIN') > -1 || process.env.NODE_ENV === 'development') {
              path = 'static/board/svg/customJanggi' + this.freeCustomID + '.svg'
            } else if ((navigator.platform.toUpperCase().indexOf('MAC') > -1 || navigator.platform.toUpperCase().indexOf('LINUX') > -1) && process.env.NODE_ENV !== 'development') {
              path = absolutePath.join(__static, '../../../../../static/board/svg/customJanggi' + this.freeCustomID + '.svg')
            }
          }
          const fs = require('fs')
          fs.writeFile(path, data, err => {
            if (err) {
              alert('An error ocurred updating the file' + err.message)
              console.log(err)
            }
          })
        })
        return true
      } else if (svgFile.canceled) {
        if (this.isInternational) {
          this.maxCustomStandardCounter--
        } else if (this.isShogi) {
          this.maxCustomShogiCounter--
        } else if (this.isXiangqi) {
          this.maxCustomXiangqiCounter--
        } else if (this.isSEA) {
          this.maxCustomSeaCounter--
        } else if (this.isJanggi) {
          this.maxCustomJanggiCounter--
        }
        return false
      }
    },
    async updateCustom (counter) {
      const reWritten = await this.reWriteSvgs(counter)
      if (reWritten) {
        setTimeout(() => {
          let boardStyleCustom

          if (this.isInternational) {
            boardStyleCustom = 'custom' + this.freeCustomID
          } else if (this.isShogi) {
            boardStyleCustom = 'customShogi' + this.freeCustomID
          } else if (this.isXiangqi) {
            boardStyleCustom = 'customXiangqi' + this.freeCustomID
          } else if (this.isSEA) {
            boardStyleCustom = 'customSea' + this.freeCustomID
          } else if (this.isJanggi) {
            boardStyleCustom = 'customJanggi' + this.freeCustomID
          }
          this.boardStyles.push(boardStyleCustom)
          if (this.isInternational) {
            localStorage.internationalBoardStyle = boardStyleCustom
            this.map.set(this.freeCustomID, false)
          } else if (this.isShogi) {
            localStorage.shogiBoardStyle = boardStyleCustom
            this.shogiMap.set(this.freeCustomID, false)
          } else if (this.isXiangqi) {
            localStorage.xiangqiBoardStyle = boardStyleCustom
            this.xiangqiMap.set(this.freeCustomID, false)
          } else if (this.isSEA) {
            localStorage.seaBoardStyle = boardStyleCustom
            this.seaMap.set(this.freeCustomID, false)
          } else if (this.isJanggi) {
            localStorage.janggiBoardStyle = boardStyleCustom
            this.janggiMap.set(this.freeCustomID, false)
          }
          this.$store.dispatch('boardStyle', boardStyleCustom)
        }, 1500)
      }
    },
    addCustom (counter) {
      if (counter > 5) {
        alert("You can't add more than 5 Custom Designs")
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
        let testCounter = 0

        if (this.isInternational) {
          this.maxCustomStandardCounter++
          this.overWriteSVGStandardcounter++
          if (this.overWriteSVGStandardcounter > 5) {
            this.overWriteSVGStandardcounter--
          }
          testCounter = this.maxCustomStandardCounter
        } else if (this.isShogi) {
          this.maxCustomShogiCounter++
          this.overWriteSVGshogiCounter++
          if (this.overWriteSVGshogiCounter > 5) {
            this.overWriteSVGshogiCounter--
          }
          testCounter = this.maxCustomShogiCounter
        } else if (this.isXiangqi) {
          this.overWriteSVGxiangqiCounter++
          this.maxCustomXiangqiCounter++
          if (this.overWriteSVGxiangqiCounter > 5) {
            this.overWriteSVGxiangqiCounter--
          }

          testCounter = this.maxCustomXiangqiCounter
        } else if (this.isSEA) {
          this.maxCustomSeaCounter++
          this.overWriteSVGseaCounter++
          if (this.overWriteSVGseaCounter > 5) {
            this.overWriteSVGseaCounter--
          }
          testCounter = this.maxCustomSeaCounter
        } else if (this.isJanggi) {
          this.maxCustomJanggiCounter++
          this.overWriteSVGjanggiCounter++
          if (this.overWriteSVGjanggiCounter > 5) {
            this.overWriteSVGjanggiCounter--
          }
          testCounter = this.maxCustomJanggiCounter
        }
        this.updateCustom(testCounter)
        return
      } else if (this.isInternational) {
        // localStorage for all different groups of board stylings
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
    },
    deleteCustom (payload) {
      const number = parseInt(payload.slice(-1))
      let path
      if (this.isInternational) {
        if (navigator.platform.toUpperCase().indexOf('WIN') > -1 || process.env.NODE_ENV === 'development') {
          path = 'static/board/svg/' + payload + '.svg'
        } else if ((navigator.platform.toUpperCase().indexOf('MAC') > -1 || navigator.platform.toUpperCase().indexOf('LINUX') > -1) && process.env.NODE_ENV !== 'development') {
          path = absolutePath.join(__static, '../../../../../static/board/svg/' + payload + '.svg')
        }
        this.maxCustomStandardCounter--
        let bool = false
        this.map.forEach((value, key) => {
          if (bool === false) {
            if (value === false && key === number) {
              bool = true
              this.overWriteSVGStandardcounter = key - 1
              this.map.set(key, true)
              this.boardStyles = this.boardStyles.filter(e => e !== payload)
            }
          }
        })
      } else if (this.isShogi) {
        if (navigator.platform.toUpperCase().indexOf('WIN') > -1 || process.env.NODE_ENV === 'development') {
          path = 'static/board/svg/' + payload + '.svg'
        } else if ((navigator.platform.toUpperCase().indexOf('MAC') > -1 || navigator.platform.toUpperCase().indexOf('LINUX') > -1) && process.env.NODE_ENV !== 'development') {
          path = absolutePath.join(__static, '../../../../../static/board/svg/' + payload + '.svg')
        }
        this.maxCustomShogiCounter--
        let bool = false
        this.shogiMap.forEach((value, key) => {
          if (bool === false) {
            if (value === false && key === number) {
              bool = true
              this.overWriteSVGshogiCounter = key - 1
              this.shogiMap.set(key, true)
              this.shogiStyles = this.shogiStyles.filter(e => e !== payload)
            }
          }
        })
      } else if (this.isXiangqi) {
        if (navigator.platform.toUpperCase().indexOf('WIN') > -1 || process.env.NODE_ENV === 'development') {
          path = 'static/board/svg/' + payload + '.svg'
        } else if ((navigator.platform.toUpperCase().indexOf('MAC') > -1 || navigator.platform.toUpperCase().indexOf('LINUX') > -1) && process.env.NODE_ENV !== 'development') {
          path = absolutePath.join(__static, '../../../../../static/board/svg/' + payload + '.svg')
        }
        this.maxCustomXiangqiCounter--
        let bool = false
        this.xiangqiMap.forEach((value, key) => {
          if (bool === false) {
            if (value === false && key === number) {
              bool = true
              this.overWriteSVGxiangqiCounter = key - 1
              this.xiangqiMap.set(key, true)
              this.xiangqiStyles = this.xiangqiStyles.filter(e => e !== payload)
            }
          }
        })
      } else if (this.isSEA) {
        if (navigator.platform.toUpperCase().indexOf('WIN') > -1 || process.env.NODE_ENV === 'development') {
          path = 'static/board/svg/' + payload + '.svg'
        } else if ((navigator.platform.toUpperCase().indexOf('MAC') > -1 || navigator.platform.toUpperCase().indexOf('LINUX') > -1) && process.env.NODE_ENV !== 'development') {
          path = absolutePath.join(__static, '../../../../../static/board/svg/' + payload + '.svg')
        }
        this.maxCustomSeaCounter--
        let bool = false
        this.seaMap.forEach((value, key) => {
          if (bool === false) {
            if (value === false && key === number) {
              bool = true
              this.overWriteSVGseaCounter = key - 1
              this.seaMap.set(key, true)
              this.seaStyles = this.seaStyles.filter(e => e !== payload)
            }
          }
        })
      } else if (this.isJanggi) {
        if (navigator.platform.toUpperCase().indexOf('WIN') > -1 || process.env.NODE_ENV === 'development') {
          path = 'static/board/svg/' + payload + '.svg'
        } else if ((navigator.platform.toUpperCase().indexOf('MAC') > -1 || navigator.platform.toUpperCase().indexOf('LINUX') > -1) && process.env.NODE_ENV !== 'development') {
          path = absolutePath.join(__static, '../../../../../static/board/svg/' + payload + '.svg')
        }
        this.maxCustomJanggiCounter--
        let bool = false
        this.janggiMap.forEach((value, key) => {
          if (bool === false) {
            if (value === false && key === number) {
              bool = true
              this.overWriteSVGjanggiCounter = key - 1
              this.janggiMap.set(key, true)
              this.janggiStyles = this.janggiStyles.filter(e => e !== payload)
            }
          }
        })
      }
      try {
        fs.unlinkSync(path)
        //  file removed
      } catch (err) {
        console.error(err)
      }
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
#DeleteButton {
  background-color: #dc143c; /* Green */
  border: none;
  color: white;
  padding: 5px 15px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 13px;
  border-radius: 5px;
  position: absolute;
  right: 4px;
}
#DeleteButton:hover {
  background-color: #8b0000;
  cursor: pointer;
}
</style>
