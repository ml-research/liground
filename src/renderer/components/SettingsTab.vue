<template>
  <div id="about">
    <title>SettingsTab</title>
    <h1>This is the Settings Tab</h1>
    <div>
      <table>
        <tr
          v-for="option in engineOptions"
          :key="option.name"
        >
          <td> {{ option.name }} </td>
          <td> {{ option.type }} </td>
          <td v-if="option.type === 'combo'">
            <select size="1">
              <option
                v-for="selOption in option.var"
                :key="selOption"
                :value="selOption"
                :selected="selOption === option.default"
              >
                {{ selOption }}
              </option>
            </select>
          </td>
          <td v-else-if="option.type === 'check'">
            <input
              type="checkbox"
              :checked="option.default === 'true'"
              :name="option.name"
            >
          </td>
          <td v-else-if="option.type === 'spin'">
            <input
              type="number"
              :step="1"
              :value="option.default"
              :min="option.min"
              :max="option.max"
            >
          </td>
          <td v-else>
            {{ option.min }} {{ option.max }}
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'SettingsTab',
  components: {
  },
  computed: {
    ...mapGetters(['engineOptions'])
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
