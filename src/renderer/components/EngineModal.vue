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
            class="input"
            type="text"
            size="20"
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
          <span class="path">{{ displayBinary }}</span>
        </div>
        <div class="item">
          <span class="label">CWD</span>
          <input
            v-model="cwd"
            class="input"
            type="text"
            size="60"
          >
        </div>
        <div class="item">
          <span class="label">Logo</span>
          <button
            class="btn grey"
            @click="selectImage"
          >
            Select Image
          </button>
          <span
            class="preview"
            :style="{ backgroundImage: `url(${logo})` }"
          />
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
import { promises as fs } from 'fs'
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
    initialBinary: {
      default: '',
      type: String
    },
    initialCwd: {
      default: '',
      type: String
    },
    initialLogo: {
      default: '',
      type: String
    }
  },
  data () {
    return {
      name: this.initialName,
      binary: this.initialBinary,
      cwd: this.initialCwd,
      logo: this.initialLogo,
      error: 'none'
    }
  },
  computed: {
    displayBinary () {
      return this.binary.length > 0 ? path.basename(this.binary) : '(empty)'
    }
  },
  methods: {
    cancel () {
      this.$emit('close')
    },
    save () {
      const { name, binary, cwd, logo } = this
      if (name.length === 0) {
        this.error = 'Engine name cannot be empty!'
      } else if (binary.length === 0) {
        this.error = 'Engine path cannot be empty!'
      } else if (this.$store.state.allEngines[name] && name !== this.initialName) {
        this.error = `Name "${name}" already in use!`
      } else {
        this.error = 'none'
        this.$emit('save', { name, binary, cwd, logo })
        this.$emit('close')
      }
    },
    async selectPath () {
      const { filePaths: [file] } = await remote.dialog.showOpenDialog({ properties: ['openFile'] })
      if (file) {
        if (this.cwd.length === 0 || this.cwd === path.dirname(this.binary)) {
          this.cwd = path.dirname(file)
        }
        this.binary = file
      }
    },
    async selectImage () {
      const { filePaths: [file] } = await remote.dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
          { name: 'Images', extensions: ['bmp', 'gif', 'jpg', 'jpeg', 'png', 'svg', 'tif', 'tiff', 'webp'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      })
      if (file) {
        const base64 = await fs.readFile(file, { encoding: 'base64' })
        this.logo = `data:image/${this.imageExtToMime(path.extname(file))};base64,${base64}`
      }
    },
    imageExtToMime (ext) {
      switch (ext) {
        case '.jpg':
        case '.jpeg':
          return 'jpeg'
        case '.tif':
        case '.tiff':
          return 'tiff'
        case '.svg':
          return 'svg+xml'
        default:
          return ext.substring(1)
      }
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
  background: var(--second-bg-color);
  box-shadow: 2px 2px 20px 1px var(--second-bg-color);
  overflow-x: auto;
}

.header {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid var(--main-border-color);
  color: var(--tab-header-color);
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
.item > * {
  margin: 0 3px;
}
.label {
  width: 6ch;
  margin-right: 5px;
  text-align: left;
  font-weight: bold;
}
.input {
  padding: 2px 3px;
  background: lightgrey;
  border: none;
  border-radius: 3px;
}
.path {
  margin-left: 10px;
  color: var(--main-text-color);
  font-family: monospace;
  font-size: 11px;
}
.preview {
  box-sizing: content-box;
  margin-left: 20px;
  width: 120px;
  height: 60px;
  background-color: var(--light-text-color);
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 5px;
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
  border-top: 1px solid var(--main-border-color);
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
  background: var(--tab-btn-color);
}
.btn.green {
  background: var(--save-btn-color);
}
.btn.red {
  background: var(--cancel-btn-color);
}
</style>
