<!-- https://www.w3schools.com/howto/howto_css_switch.asp -->
<template>
  <label class="switch">
    <input
      type="checkbox"
      :checked="engineActive"
    >
    <span class="slider round" />
  </label>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'RoundedSwitch',
  data () {
    return {
      engineActive: false
    }
  },
  computed: {
    ...mapGetters(['active', 'PvE', 'turn'])
  },
  watch: {
    active () {
      if (this.active && !this.turn && this.PvE) {
        this.$store.dispatch('goEnginePvE')
      }
    }
  },
  methods: {
    changeActiveState (payload) {
      this.engineActive = payload
    },
    onClick () {
      if (!this.active) {
        this.$store.dispatch('position')
        if (this.PvE) {
          this.$store.dispatch('setActiveTrue')
        } else {
          this.$store.dispatch('goEngine')
        }
      } else {
        this.$store.dispatch('stopEngine')
      }
    }
  }
}
</script>

<style scoped>
/* The switch - the box around the slider */
.switch {
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
