<template>
  <div id="about">
    <title>SettingsTab</title>
    <h1 @click="changeTab">
      This is the Settings Tab
    </h1>
    <div>
      <table>
        <tr
          v-for="option in engineOptions"
          :key="option.name"
        >
          <td> {{ option.name }} </td>
          <td> {{ option.type }} </td>
          <td v-if="option.type === 'combo'">
            <select
              v-model="engineSettingsForm[option.name]"
              size="1"
            >
              <option
                v-for="selOption in option.var"
                :key="selOption"
                :value="selOption"
              >
                {{ selOption }}
              </option>
            </select>
          </td>
          <td v-else-if="option.type === 'check'">
            <input
              v-model="engineSettingsForm[option.name]"
              type="checkbox"
              :name="option.name"
            >
          </td>
          <td v-else-if="option.type === 'spin'">
            <input
              v-model="engineSettingsForm[option.name]"
              type="number"
              :step="1"
              :min="option.min"
              :max="option.max"
            >
          </td>
          <td v-else-if="option.type === 'string'">
            <input
              v-model="engineSettingsForm[option.name]"
              type="text"
              :name="option.name"
            >
          </td>
          <td v-else-if="option.type === 'button'">
            <button type="button">
              {{ option.name }}
            </button>
          </td>
        </tr>
      </table>
      <a @click="changeSettings()">Change Settings</a>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'SettingsTab',
  components: {
  },
  data: function () {
    return {
      engineSettingsForm: {}
    }
  },
  computed: {
    ...mapGetters(['engineOptions'])
  },
  created: function () {
    for (const option of this.engineOptions) {
      if (option.type !== 'button') {
        this.engineSettingsForm[option.name] = option.type === 'check' ? option.default === 'true' : option.default
      }
    }
  },
  methods: {
    changeTab () {
      this.$store.commit('viewAnalysis', !this.$store.getters.viewAnalysis)
      console.log(this.engineOptions[0])
    },
    changeSettings () {
      this.$store.dispatch('setEngineOptions', this.engineSettingsForm)
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
