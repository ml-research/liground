<template>
  <div class="modal">
    <div
      class="backdrop"
      @click="cancel"
    />
    <div class="contents">
      <header class="header">
        <em class="icon mdi mdi-information-outline" />
        {{ "    " + title + "    " }} <em class="icon mdi mdi-github" />
      </header>
      <section class="body">
        <div class="item">
          <span>
            {{
              'A free, open-source and modern Chess Variant Analysis GUI for the 21 century'
            }}
          </span>
        </div>
        <div
          class="item"
          style="white-space: pre-line"
        >
          <span>
            {{ 'Version: 0.4.0' }}
          </span>
        </div>
        <div class="item">
          <span>
            {{ 'License: AGPL-3.0' }}
          </span>
        </div>
        <div class="item">
          <span>
            {{ 'Find our official' }}
          </span>
          <button
            class="btn aboutTab"
            @click="openGitHub"
          >
            GitHub
          </button>
        </div>
        <div class="item">
          <span>
            {{ "Read more about our" }}
          </span>
          <button
            class="btn aboutTab"
            @click="openLicense"
          >
            License
          </button>
        </div>
        <div
          class="item"
          style="white-space: pre-line"
        >
          <span>
            {{ 'Our Authors:' }}
          </span>
        </div>
        <div class="item">
          <span>
            {{ 'Johannes Czech' }}
          </span>
        </div>
        <div class="item">
          <span>
            {{
              'Laurin Bielich, Jannik Holmer, Peter Mader, Simon Muchau, Martin Ruzicka,'
            }}
          </span>
        </div>
        <div class="item">
          <span>
            {{
              'Daniel Creß, Samuel Gajdos, Gökay Karaahmetli, Lena-Marie Munderich, Leif Schwaß'
            }}
          </span>
        </div>
      </section>
      <footer class="footer">
        <button
          type="button"
          class="btn aboutTab"
          @click="cancel"
        >
          Close
        </button>
      </footer>
    </div>
  </div>
</template>

<script>
import { shell } from 'electron'

export default {
  name: 'AboutTabModal',
  props: {
    title: {
      required: true,
      type: String
    }
  },
  methods: {
    cancel () {
      this.$emit('close')
    },
    openGitHub () {
      shell.openExternal('https://github.com/ml-research/liground')
    },
    openLicense () {
      shell.openExternal(
        'https://github.com/ml-research/liground/blob/master/LICENSE'
      )
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
  background-color: rgba(0, 0, 0, 0.3);
  z-index: -1;
}
.contents {
  display: flex;
  flex-direction: column;
  background: var(--second-bg-color);
  box-shadow: 2px 2px 20px 1px var(--second-bg-color);
  overflow-x: 10px;
}
.item {
  margin: 5px 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 1em;
}
.item > * {
  margin: 0 10px;
}
.header {
  font-size: 20px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid var(--main-border-color);
  color: var(--tab-header-color);
  user-select: none;
}
.footer {
  padding: 15px;
  display: flex;
  justify-content: center;
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
.btn.aboutTab {
  background: var(--tab-btn-color);
}
</style>
