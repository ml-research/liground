<template>
  <div class="settings">
    <div>
      <p>DarkMode</p>
      <DarkModeSwitch class="darkSwitch" />
    </div>
    <span class="title">Engine Settings</span>
    <table class="table">
      <tr
        v-for="option in engineOptions"
        :key="option.name"
      >
        <td> {{ option.name }} </td>
        <template v-if="option.type === 'combo'">
          <td>
            <select
              v-model="settings[option.name]"
              size="1"
              class="input"
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
        </template>
        <template v-else-if="option.type === 'check'">
          <td>
            <input
              v-model="settings[option.name]"
              type="checkbox"
              class="input"
            >
          </td>
        </template>
        <template v-else-if="option.type === 'spin'">
          <td>
            <input
              v-model.number="settings[option.name]"
              type="number"
              class="input"
              step="1"
              :min="option.min"
              :max="option.max"
              @change="clampNumber(option.name, option.min, option.max)"
            >
          </td>
        </template>
        <template v-else-if="option.type === 'string'">
          <td>
            <input
              v-model="settings[option.name]"
              type="text"
              class="input"
            >
          </td>
        </template>
        <template v-else-if="option.type === 'button'">
          <td>
            <button
              type="button"
              class="input"
              @click="triggerButtonSetting(option.name)"
            >
              {{ option.name }}
            </button>
          </td>
        </template>
      </tr>
    </table>
    <a
      class="btn green"
      @click="save"
    >
      Save
    </a>
    <a
      class="btn red"
      @click="cancel"
    >
      Cancel
    </a>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import DarkModeSwitch from './DarkModeSwitch.vue'
export default {
  name: 'SettingsTab',
  components: {
    DarkModeSwitch
  },
  data () {
    return {
      settings: {}
    }
  },
  computed: {
    ...mapGetters(['variant', 'engineOptions', 'engineSettings'])
  },
  watch: {
    engineOptions () {
      this.resetSettings()
    }
  },
  methods: {
    save () {
      this.updateSettings()
      this.$store.commit('viewAnalysis', true)
    },
    cancel () {
      this.resetSettings()
      this.$store.commit('viewAnalysis', true)
    },
    updateSettings () {
      const changed = {}
      for (const [name, value] of Object.entries(this.settings)) {
        if (value !== this.engineSettings[name]) {
          changed[name] = value
        }
      }
      this.$store.dispatch('setEngineOptions', changed)
    },
    clampNumber (name, min, max) {
      this.settings[name] = Math.max(min, Math.min(max, this.settings[name]))
    },
    triggerButtonSetting (optionName) {
      this.$store.dispatch('setEngineOptions', { [optionName]: null })
    },
    resetSettings () {
      this.settings = {}
      for (const { name, type } of this.engineOptions) {
        if (type !== 'button') {
          this.settings[name] = this.engineSettings[name]
        }
      }
    }
  }
}
</script>

<style scoped>
.settings {
  display: flex;
  flex-direction: column;
}
.title {
  font-size: 1.2em;
  text-align: center;
}
.table {
  font-size: 0.9em;
  text-align: left;
}

input[type=number] {
  text-align: right;
}
/* make arrows of number input always visible */
input[type=number]::-webkit-inner-spin-button {
  opacity: 0.5;
}

.input {
  width: 100%;
  background-color: var(--second-bg-color);
  color: var(--main-text-color);
}

.btn {
  border-radius: 2px;
  cursor: pointer;
  display: block;
  width: 250px;
  margin: 0.2em auto;
}
.btn.red {
  color: white;
  background-color: #b22222;
}
.btn.red:hover {
  background-color: #8b1919;
}
.btn.green {
  color: white;
  background-color: #4AAE9B;
}
.btn.green:hover {
  background-color: #3c8577;
}
</style>
