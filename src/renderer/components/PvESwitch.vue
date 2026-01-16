
<template>
  <!-- PvE Switch is a Legacy Component replaced by NewGameButton -->
  <div class="panel">
    <label class="switch">
      <input
        type="checkbox"
        :checked="PvE"
        @click="onClick"
      >
      <span class="slider round" />
    </label>
    <OpeningSuitModal
      v-if="modal.visible"
      :title="modal.title"
      @close="modal.visible = false"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { engine } from '../engine'
import OpeningSuitModal from './OpeningSuitModal'

export default {
  name: 'PvESwitch',
  components: { OpeningSuitModal },
  data () {
    return {
      modal: {
        visible: false,
        title: '',
        save: () => {}
      }
    }
  },
  computed: {
        ...mapGetters(['PvE', 'active', 'turn', 'multipv', 'depth', 'PvEPlayerIsWhite'])
  },
  watch: {
    depth () {
      // If the analysis depth changes while in PvE during the player's turn, reset engine data.
      if (this.active && this.PvE && this.depth > 0) {
        const engineToMoveNow = (this.turn && !this.PvEPlayerIsWhite) || (!this.turn && this.PvEPlayerIsWhite)
        if (!engineToMoveNow) {
          this.$store.dispatch('resetEngineData')
          this.$store.commit('resetEngineTime')
        }
      }
    },
    turn () {
         if (this.PvE) {
        const engineToMoveNow = (this.turn && !this.PvEPlayerIsWhite) || (!this.turn && this.PvEPlayerIsWhite)
        if (!engineToMoveNow) { // player turn: reset engine timers/data.
          this.$store.dispatch('resetEngineData')
          this.$store.commit('resetEngineTime')
        } else { // engine turn: start engine for PvE.
          engine.send('stop')
          this.$store.dispatch('goEnginePvE')
        }
      }
    },
    PvE () {
      // This watcher reacts to entering/exiting PvE mode.
      if (!this.active && !this.PvE && this.turn) {
        this.$store.dispatch('position')
      }

      if (this.active && this.PvE) {
        const engineToMoveNow = (this.turn && !this.PvEPlayerIsWhite) || (!this.turn && this.PvEPlayerIsWhite)
        if (!engineToMoveNow) {
          // player turn: reset engine state and stop any running PvE engine task.
          this.$store.dispatch('resetEngineData')
          this.$store.commit('resetEngineTime')
          this.$store.dispatch('stopEnginePvE')
        } else {
          // engine turn: start engine for PvE.
          engine.send('stop')
          this.$store.dispatch('goEnginePvE')
        }
      }

      // Note: starting PvE via the switch intentionally sets playerIsWhite: true (human = White).
      // The actual behavior for "player is Black" is handled in the store 'PvEtrue' action which
      // will kick off the engine immediately if the engine must move on enable.
    }
  },
  methods: {
    onClick () {
      if (!this.PvE) {
        // PvESwitch historically starts PvE with the human as White.
        // Pass playerIsWhite: true to preserve legacy behavior.
        this.$store.dispatch('PvEtrue', { playerIsWhite: true })
        if (confirm('Do you want to start with opening suit?')) {
          this.openingSuit()
        }
      } else {
        this.$store.dispatch('PvEfalse')
      }
    },
    openingSuit () {
      this.modal = {
        visible: true,
        title: 'Select Opening Suit'
      }
    }
  }
}
</script>

<style scoped>
/* The switch - the box around the slider */
.switch {
 margin-left: 8px;
 position: relative;
 display: inline-block;
 width: 60px;
 height: 34px;
}

/* Hide default HTML checkbox */
.switch input {
 opacity: 0;
 width: 0;
 height: 0;
}

/* The slider */
.slider {
 position: absolute;
 cursor: pointer;
 top: 0;
 left: 0;
 right: 0;
 bottom: 0;
 background-color: #ccc;
 -webkit-transition: .4s;
 transition: .4s;
}

.slider:before {
 position: absolute;
 content: '';
 height: 26px;
 width: 26px;
 left: 4px;
 bottom: 4px;
 background-color: var(--second-bg-color);
 -webkit-transition: .4s;
 transition: .4s;
}

input:checked + .slider {
 background-color: var(--highlight-color);
}

input:focus + .slider {
 box-shadow: 0 0 1px var(--highlight-color);
}

input:checked + .slider:before {
 -webkit-transform: translateX(26px);
 -ms-transform: translateX(26px);
 transform: translateX(26px);
}

/* Rounded sliders */
.slider.round {
 border-radius: 34px;
}

.slider.round:before {
 border-radius: 50%;
}
</style>
