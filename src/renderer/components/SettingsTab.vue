<template>
  <div id="settings">
    <div>
      <table>
        <caption> Engine Settings </caption>
        <tr>
          <th> Parameter </th>
          <th> Value </th>
          <th class="range">
            Range
          </th>
        </tr>
        <tr
          v-for="option in engineOptions"
          :key="option.name"
        >
          <td> {{ option.name }} </td>
          <template v-if="option.type === 'combo'">
            <td>
              <select
                v-model="engineSettingsForm[option.name]"
                size="1"
                class="settings-element"
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
            <td class="range" />
          </template>
          <template v-else-if="option.type === 'check'">
            <td>
              <input
                v-model="engineSettingsForm[option.name]"
                type="checkbox"
                :name="option.name"
                class="settings-element"
              >
            </td>
            <td class="range">
              boolean
            </td>
          </template>
          <template v-else-if="option.type === 'spin'">
            <td>
              <input
                v-model="engineSettingsForm[option.name]"
                type="number"
                :step="1"
                :min="option.min"
                :max="option.max"
                class="settings-element"
              >
            </td>
            <td class="range">
              {{ option.min }} to {{ option.max }}
            </td>
          </template>
          <template v-else-if="option.type === 'string'">
            <td>
              <input
                v-model="engineSettingsForm[option.name]"
                type="text"
                :name="option.name"
                class="settings-element"
              >
            </td>
            <td class="range">
              {{ option.type }}
            </td>
          </template>
          <template v-else-if="option.type === 'button'">
            <td>
              <button
                type="button"
                class="settings-element"
              >
                {{ option.name }}
              </button>
            </td>
            <td class="range" />
          </template>
        </tr>
      </table>
      <a
        class="btn-green"
        @click="changeSettings()"
      >
        Change Settings
      </a>
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
    cursor: pointer;
  }

  table, th, td {
    background-color: white;
    border: 1px solid black;
    border-collapse: collapse;
    text-align: left;
    font-size: 0.9em;
  }

  table {
    margin: 1em;
  }

  th {
    border-bottom: 4px double black;
  }

  input[type=number]::-webkit-inner-spin-button {
    opacity: 1
  }

  input[type=number] {
    text-align: right;
  }
  .settings-element {
    width: 100%;
  }

  .range {
    text-align: right;
  }
</style>
