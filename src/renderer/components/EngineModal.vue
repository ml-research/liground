<template>
  <div class="modal">
    <div
      class="backdrop"
      @click="cancel"
    />
    <div class="contents">
      <header class="header">
        {{ title }}
      </header>
      <section class="body">
        <div class="item">
          <span class="label">Name</span>
          <input
            v-model="name"
            type="text"
            class="input"
          >
        </div>
        <div class="item">
          <span class="label">Binary</span>
          <button
            class="btn grey"
            @click="selectPath"
          >
            Select Path
          </button>
          <span class="display">{{ display }}</span>
        </div>
        <div class="item">
          <span
            class="error"
            :class="{ visible: error !== 'none' }"
          >{{ error }}</span>
        </div>
      </section>
      <footer class="footer">
        <button
          type="button"
          class="btn red"
          @click="cancel"
        >
          Cancel
        </button>
        <button
          type="button"
          class="btn green"
          @click="save"
        >
          Save
        </button>
      </footer>
    </div>
  </div>
</template>

<script>
import path from 'path'
import { remote } from 'electron'

export default {
  name: 'EngineModal',
  props: {
    title: {
      required: true,
      type: String
    },
    initialName: {
      default: '',
      type: String
    },
    initialPath: {
      default: '',
      type: String
    }
  },
  data () {
    return {
      name: this.initialName,
      path: this.initialPath,
      error: 'none'
    }
  },
  computed: {
    display () {
      return this.path.length > 0 ? path.basename(this.path) : 'empty'
    }
  },
  methods: {
    cancel () {
      this.$emit('close')
    },
    save () {
      const { name, path } = this
      if (name.length === 0) {
        this.error = 'Engine name cannot be empty!'
      } else if (path.length === 0) {
        this.error = 'Engine path cannot be empty!'
      } else if (this.$store.state.allEngines[name]) {
        this.error = `Name "${name}" already in use!`
      } else {
        this.error = 'none'
        this.$emit('save', { name, path })
        this.$emit('close')
      }
    },
    async selectPath () {
      const { filePaths: [file] } = await remote.dialog.showOpenDialog({ properties: ['openFile'] })
      this.path = file || ''
    }
  }
}
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}
.backdrop {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, .3);
  z-index: -1;
}

.contents {
  display: flex;
  flex-direction: column;
  background: #FFFFFF;
  box-shadow: 2px 2px 20px 1px;
  overflow-x: auto;
}

.header {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
  color: #4AAE9B;
  user-select: none;
}

.body {
  padding: 10px;
  display: flex;
  flex-direction: column;
}
.item {
  margin: 5px 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: .9em;
}
.label {
  font-weight: bold;
  margin-right: 5px;
}
.display {
  font-family: monospace;
  color: #333;
  font-size: 11px;
}
.error {
  color: #b22222;
  font-weight: bold;
}
.error:not(.visible) {
  visibility: hidden;
}

.footer {
  padding: 15px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #eee;
  user-select: none;
}
.btn {
  padding: 2px 3px;
  margin: 2px;
  border: none;
  border-radius: 2px;
  color: white;
  cursor: pointer;
}
.btn.grey {
  background: #333;
}
.btn.green {
  background: #4AAE9B;
}
.btn.red {
  background: #b22222;
}
</style>
