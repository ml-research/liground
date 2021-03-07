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
                v-model.number="engineSettingsForm[option.name]"
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
                @click="triggerButtonSetting(option.name)"
              >
                {{ option.name }}
              </button>
            </td>
            <td class="range" />
          </template>
        </tr>
      </table>
      <a
        class="btn green"
        @click="changeSettings(engineSettingsForm)"
      >
        Change Settings
      </a>
      <a
        class="btn red"
        @click="changeTab()"
      >
        close
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
    ...mapGetters(['variant', 'engineOptions', 'engineSettings'])
  },
  created () {
    for (const { name, type } of this.engineOptions) {
      if (type !== 'button') {
        this.engineSettingsForm[name] = this.engineSettings[name]
      }
    }
  },
  methods: {
    changeTab () {
      this.$store.commit('viewAnalysis', !this.$store.getters.viewAnalysis)
    },
    changeSettings (settings) {
      console.log(settings)
      this.$store.dispatch('setEngineOptions', settings)
    },
    triggerButtonSetting (optionName) {
      const settings = {}
      settings[optionName] = null
      this.changeSettings(settings)
    }
  }
}

</script>
<style scoped>
  .btn {
    border-radius: 2px;
    cursor: pointer;
    display: block;
    width: 250px;
    margin: 0.2em auto;
  }

  .red {
    color: white;
    background-color: #b22222;
  }

  .red.btn:hover{
    background-color: #8b1919;
  }

  .green {
    color: white;
    background-color: #4AAE9B;
  }

  .green.btn:hover {
    background-color: #3c8577;
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

  /* make arrows of number input always visible */
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
