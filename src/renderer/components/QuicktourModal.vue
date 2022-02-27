<template>
  <div class="modal">
    <div
      class="backdrop"
      @click="cancel"
    />
    <div class="contents">
      <header class="header">
        <em class="icon mdi mdi-map-search" />
        {{ "    " + title }}
      </header>
      <section class="body">
        <div
          v-if="QuickTourIndex === 0"
          id="Starter"
        >
          <div
            class="item"
            style="white-space: pre-line"
          >
            <span>
              {{ 'You don`t know how to get started?' }}
            </span>
          </div>
          <div
            class="item"
            style="white-space: pre-line"
          >
            <span>
              {{ 'Or you want to know how to use a specific feature?' }}
            </span>
          </div>
          <div
            class="item"
            style="white-space: pre-line"
          >
            <span>
              {{ 'Welcome to our little QuickGuide to LiGround' }}
            </span>
          </div>
        </div>
        <div
          v-if="QuickTourIndex === 1"
          id="PGN-Browser"
        >
          <div
            class="item"
            style="white-space: pre-line"
          >
            <span>
              {{ 'The PGN-Browser' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ ' Here you can upload and manage your PGN-files. ' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ ' You can search for specific files, add new ones ' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ ' and you can filter them. ' }}
            </span>
          </div>
        </div>
        <div
          v-if="QuickTourIndex === 2"
          id="Chessboard"
        >
          <div
            class="item"
          >
            <span>
              {{ ' The Chessboard ' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ ' This is where your chess game takes place. ' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ ' You can adjust the size by holding down Strg/Ctrl and using the mouse wheel ' }}
            </span>
          </div>
        </div>
        <div
          v-if="QuickTourIndex === 3"
          id="Eval-Bar"
        >
          <div
            class="item"
          >
            <span>
              {{ ' The Evaluation-Bar. ' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ ' This is a graphic indicator for the winning' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ ' chances of Black and White. ' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ ' You want to see more of this calculation? ' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ ' Try working with the Evaluation Graph! ' }}
            </span>
          </div>
        </div>
        <div
          v-if="QuickTourIndex === 4"
          id="FEN-Field"
        >
          <div
            class="item"
          >
            <span>
              {{ ' The FEN-Field ' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ ' You want to change the position of the ' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ ' pieces without placing them individually? ' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ ' Here you can paste a FEN-String! ' }}
            </span>
          </div>
        </div>
        <div
          v-if="QuickTourIndex === 5"
          id="Selection"
        >
          <div
            class="item"
          >
            <span>
              {{ ' The Style Selectors ' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ ' With the two drop down menues you can freely' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ ' choose your prefered board- and piece-styles.' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ ' The Eval-Depth ' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ ' This sets the Depth in Nodes for the Evaluation. ' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ ' Move your pieces, start your engine, choose your ' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ ' prefered depth, hit start and watch your graph grow! ' }}
            </span>
          </div>
        </div>
        <div
          v-if="QuickTourIndex === 6"
          id="Eval-Graph"
        >
          <div
            class="item"
          >
            <span>
              {{ 'The Evaluation Graph' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ 'This is where you can see the visual evaluation of' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ 'the winning chances of Black and White through your' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ 'chosen moves. You can drag the graph, zoom in and out,' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ 'hold it and save your evaluation by exporting it.' }}
            </span>
          </div>
        </div>
        <div
          v-if="QuickTourIndex === 7"
          id="Gamemode-Selector"
        >
          <div
            class="item"
          >
            <span>
              {{ ' The Gamemode-Selector ' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ 'Here you can freely choose your prefered gamemode' }}
            </span>
          </div>
        </div>
        <div
          v-if="QuickTourIndex === 8"
          id="960 Mode"
        >
          <div
            class="item"
          >
            <span>
              {{ ' The 960 Mode ' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ 'With this Mode you can change your gamemode ' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ 'to the 960 version. Input any number and press' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ ' Enter or click  the button for a random Board.' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ ' Mode 960 is compatible with: Chess, Crazyhouse, ' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ ' King of the Hill, 3check, Antichess, Atomic and Horde. ' }}
            </span>
          </div>
        </div>
        <div
          v-if="QuickTourIndex === 9"
          id="PvE-Button"
        >
          <div
            class="item"
          >
            <span>
              {{ ' The Player-vs-Engine Mode ' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ ' Press this Button to play against the engine selected. ' }}
            </span>
          </div>
        </div>
        <div
          v-if="QuickTourIndex === 10"
          id="AnalysisHead"
        >
          <div
            class="item"
          >
            <span>
              {{ 'The Engine-Selector' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ 'This is where you can select the engine. ' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ ' On the right side, you can turn it on and off.' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ 'To add new engines or change parameters, check the' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ 'settings on the left of the menu bar. ' }}
            </span>
          </div>
        </div>
        <div
          v-if="QuickTourIndex === 11"
          id="Engine-Stats"
        >
          <div
            class="item"
          >
            <span>
              {{ ' The Engine Statistics ' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ ' You need further information about the calculation ' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ ' of the engine? You will most likely find it here! ' }}
            </span>
          </div>
        </div>
        <div
          v-if="QuickTourIndex === 12"
          id="MoveCalculation"
        >
          <div
            class="item"
          >
            <span>
              {{ ' The calculated movesets ' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ ' Here you can see the 5 best movesets ' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ ' calculated by the engine. They are visualized by the' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ ' arrows on the gameboard. The best move is shown at' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ ' the first position. Hover over the movesets to' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ 'highlight the corresponding arrows. ' }}
            </span>
          </div>
        </div>
        <div
          v-if="QuickTourIndex === 13"
          id="Move History"
        >
          <div
            class="item"
          >
            <span>
              {{ ' The Move History ' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ ' When moves are made, here you can see their history. ' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ ' You can go back to previous positions by ' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ ' pressing on the move you want to return to. ' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ ' You can create different branches as well. ' }}
            </span>
          </div>
        </div>
        <div
          v-if="QuickTourIndex === 14"
          id="Jump-Buttons"
        >
          <div
            class="item"
          >
            <span>
              {{ 'The Navigation Buttons' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ 'You can navigate through your game by using' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ 'these buttons. You can also hover over the' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ 'Gameboard with your mouse and scroll ' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ 'over your game by using the mousewheel. ' }}
            </span>
          </div>
        </div>
        <div
          v-if="QuickTourIndex === 15"
          id="Game-Info"
        >
          <div
            class="item"
          >
            <span>
              {{ ' The Game Information ' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ ' When choosing a PGN file from the PGN-Browser' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ ' the Information about the two players will be ' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ ' shown here. ' }}
            </span>
          </div>
        </div>
        <div
          v-if="QuickTourIndex === 16"
          id="EngineConsole"
        >
          <div
            class="item"
          >
            <span>
              {{ ' The Engine Console ' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ ' In this console the different commands of the ' }}
            </span>
          </div>
          <div
            class="item"
          >
            <span>
              {{ ' calculating engine will be displayed.  ' }}
            </span>
          </div>
        </div>
      </section>
      <footer class="footer">
        <button
          type="button"
          class="btn aboutTab"
          @click="cancel"
        >
          Close
        </button>
        <button
          v-if="QuickTourIndex !== 0"
          type="button"
          class="btn quickGuide"
          @click="prevToolTip"
        >
          Previous
        </button>
        <button
          v-if="QuickTourIndex !== 16"
          type="button"
          class="btn quickGuide"
          @click="nextToolTip"
        >
          Next
        </button>
      </footer>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'QuicktourModal',
  props: {
    title: {
      required: true,
      type: String
    }
  },
  data () {
    return {
      toolTip: 0,
      showStarter: true
    }
  },
  computed: {
    ...mapGetters(['QuickTourIndex'])
  },
  methods: {
    cancel () {
      this.$store.dispatch('quicktourSetZero')
      this.$emit('close')
    },
    nextToolTip () {
      this.$store.dispatch('quicktourIndexIncr')
    },
    prevToolTip () {
      this.$store.dispatch('quicktourIndexDecr')
    }
  }
}
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  bottom: 50%;
  left: -30%;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}
.contents {
  display: flex;
  border: 1px solid var(--main-border-color);
  flex-direction: column;
  background: var(--second-bg-color);
  box-shadow: 2px 2px 20px 1px var(--second-bg-color);
  overflow-x: 10px;
}
.item {
  margin: 5px 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 1em;
}
.item > * {
  margin: 0 10px;
}
.image {
  box-sizing: content-box;
  width: 400px;
  height: 52px;
  background-color: var(--background-color);;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 5px;
}
.header {
  font-size: 20px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid var(--main-border-color);
  color: var(--tab-header-color);
  user-select: none;
}
.body{
  height: 150px;
}
.footer {
  padding: 15px;
  display: flex;
  justify-content: center;
  border-top: 1px solid var(--main-border-color);
  user-select: none;
}
.btn {
  padding: 2px 3px;
  margin: 2px;
  border: none;
  border-radius: 2px;
  color: white;
  cursor: pointer;
}
.btn.aboutTab {
  background: var(--tab-btn-color);
}
.btn.quickGuide {
    background: var(--tab-btn-color);
}
</style>
