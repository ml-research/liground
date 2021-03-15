<template>
  <div id="about">
    <title>SettingsTab</title>
    <h1>This is the Settings Tab</h1>
    <div>
      <div>
        <p>DarkMode</p>
        <DarkModeSwitch class="darkSwitch" />
      </div>
      <PrettyCheck
        class="p-icon p-curve p-smooth"
        color="primary-o"
      >
        <em
          slot="extra"
          class="icon mdi mdi-check"
        />
        <p>Option 1</p>
      </PrettyCheck>
      <br>
      <PrettyCheck
        class="p-icon p-curve p-smooth"
        color="primary-o"
      >
        <em
          slot="extra"
          class="icon mdi mdi-check"
        />
        Option 2
      </PrettyCheck>
      <br>
      <PrettyCheck
        class="p-icon p-curve p-smooth"
        color="primary-o"
      >
        <em
          slot="extra"
          class="icon mdi mdi-check"
        />
        Option 3
      </PrettyCheck>
      <br>
    </div>
    <div>
      <button
        type="button"
        class="btn-green"
        @click="changeTab"
      >
        <p>Change the Tab</p>
      </button>
    </div>
  </div>
</template>

<script>
import PrettyCheck from 'pretty-checkbox-vue/check'
import DarkModeSwitch from './DarkModeSwitch.vue'
export default {
  name: 'SettingsTab',
  components: {
    DarkModeSwitch,
    PrettyCheck
  },
  methods: {
    changeTab () {
      this.$store.commit('viewAnalysis', !this.$store.getters.viewAnalysis)
    }
  }
}

</script>
<style scoped>
  .btn-green {
    color: white;
    background: #4AAE9B;
    border: 1px solid #4AAE9B;
    border-radius: 2px;
  }
</style>
