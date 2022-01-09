<template>
  <div class="settings">
    <div class="panel">
      <span class="title">LiGround Settings</span>
      <div class="switch-container">
        <span>Dark Mode</span>
        <DarkModeSwitch />
        <span>Mute</span>
        <MuteButton />
      </div>
      <a
        class="btn green"
        @click="saveStandartSettings"
      >
        Save as standart
      </a>
    </div>
    <div class="panel">
      <span class="title">Engine Settings</span>
      <div class="bar">
        <EngineSelect class="select" />
        <div
          class="icon blue mdi mdi-pencil"
          @click="editEngine"
        />
        <div
          class="icon red mdi mdi-delete"
          @click="deleteEngine"
        />
        <div
          class="icon green mdi mdi-plus-circle"
          @click="addEngine"
        />
      </div>
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
                :name="option.name"
                class="input"
              >
            </td>
          </template>
          <template v-else-if="option.type === 'spin'">
            <td>
              <input
                v-model.number="settings[option.name]"
                type="number"
                :step="1"
                :min="option.min"
                :max="option.max"
                class="input"
              >
            </td>
          </template>
          <template v-else-if="option.type === 'string'">
            <td>
              <input
                v-model="settings[option.name]"
                type="text"
                :name="option.name"
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
      <EngineModal
        v-if="modal.visible"
        :title="modal.title"
        :initial-name="modal.name"
        :initial-binary="modal.binary"
        :initial-cwd="modal.cwd"
        :initial-logo="modal.logo"
        @close="modal.visible = false"
        @save="modal.save"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import EngineSelect from './EngineSelect'
import EngineModal from './EngineModal'
import DarkModeSwitch from './DarkModeSwitch'
import MuteButton from './MuteButton'
import defaultLogo from '../assets/images/engines/chess_engine.svg'

export default {
  name: 'SettingsTab',
  components: { EngineSelect, EngineModal, DarkModeSwitch, MuteButton },
  data () {
    return {
      settings: {},
      modal: {
        visible: false,
        title: '',
        save: () => {}
      }
    }
  },
  computed: {
    ...mapGetters(['variant', 'engineOptions', 'engineSettings', 'selectedEngine'])
  },
  watch: {
    engineOptions () {
      this.resetSettings()
    }
  },
  methods: {
    saveStandartSettings () {
      this.$store.dispatch('saveSettings')
      this.$store.commit('viewAnalysis', true)
    },
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
    },
    editEngine () {
      const { name, binary, cwd, logo } = this.selectedEngine
      this.modal = {
        visible: true,
        title: 'Edit Engine',
        name,
        binary,
        logo,
        cwd,
        save: data => this.$store.dispatch('editEngine', {
          old: this.selectedEngine.name,
          changed: data
        })
      }
    },
    deleteEngine () {
      const { name } = this.selectedEngine
      if (confirm(`Do you really wish to delete "${name}"`)) {
        this.$store.dispatch('deleteEngine', name)
      }
    },
    addEngine () {
      this.modal = {
        visible: true,
        title: 'Add new Engine',
        logo: defaultLogo,
        save: data => this.$store.dispatch('addEngine', data)
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
.panel {
  padding: 10px;
  border: 1px solid var(--main-border-color);
  border-radius: 3px;
  display: flex;
  flex-direction: column;
}
.panel + .panel {
  margin-top: 20px;
}

.switch-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  align-self: center
}
.switch-container > * {
  margin: 0 5px;
}

.bar {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.bar > * {
  margin: 0 5px;
}
.select {
  flex-grow: 1;
}
.icon {
  width: 40px;
  height: 40px;
  border: 1px solid #e8e8e8;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #757575;
  cursor: pointer;
}
.icon.green:hover {
  color: #4aae9b;
}
.icon.blue:hover {
  color: #2470b6;
}
.icon.red:hover {
  color: #b22222;
}

.title {
  font-size: 1.2em;
  text-align: center;
}
.table {
  width: 100%;
  margin: 10px 0;
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
  border: 1px solid var(--main-border-color);
}

.btn {
  border-radius: 2px;
  cursor: pointer;
  display: block;
  width: 250px;
  margin: 3px auto;
}
.btn.green {
  color: white;
  background-color: var(--save-btn-color);
}
.btn.green:hover {
  background-color: #3c8577;
}
.btn.red {
  color: white;
  background-color: var(--cancel-btn-color);
}
.btn.red:hover {
  background-color: #8b1919;
}
</style>
