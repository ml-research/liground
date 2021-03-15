<!-- https://www.w3schools.com/howto/howto_css_switch.asp -->
<template>
  <label class="switch">
    <input
      type="checkbox"
      :checked="darkMode"
      @click="onClick"
    >
    <span class="slider round" />
  </label>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'DarkModeSwitch',
  computed: {
    ...mapGetters(['darkMode'])
  },
  methods: {
    onClick () {
      this.root = document.documentElement
      if (!this.darkMode) {
        this.root.style.setProperty('--main-bg-color', '#222326')
        this.root.style.setProperty('--second-bg-color', '#4b4e54')
        this.root.style.setProperty('--main-text-color', 'lightgrey')
        this.root.style.setProperty('--main-border-color', '#888')
        this.root.style.setProperty('--scroll-track-color', '#4b4e54')
        this.root.style.setProperty('--scroll-thumb-color', '#222326')

        this.$store.dispatch('switchDarkMode')
      } else {
        this.root.style.setProperty('--main-bg-color', 'white')
        this.root.style.setProperty('--second-bg-color', 'white')
        this.root.style.setProperty('--main-text-color', '#2c3e50')
        this.root.style.setProperty('--main-border-color', 'black')
        this.root.style.setProperty('--scroll-track-color', 'lightgrey')
        this.root.style.setProperty('--scroll-thumb-color', 'grey')

        this.$store.dispatch('switchDarkMode')
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
 background-color: #2196F3;
}

input:focus + .slider {
 box-shadow: 0 0 1px #2196F3;
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
