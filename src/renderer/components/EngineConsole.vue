<template>
  <div class="container">
    <div class="console">
      <!-- TODO: use lazy loading/rendering for console? this can get pretty large! -->
      <div
        v-for="(line, i) in io"
        :key="i"
        class="line"
      >
        {{ line }}
      </div>
    </div>
    <input
      v-model="cmd"
      class="input"
      type="text"
      size="60"
      @keyup="onKeyup"
    >
  </div>
</template>

<script>
import engine from '../engine'

export default {
  name: 'EngineConsole',
  data () {
    return { cmd: '', io: [] }
  },
  mounted () {
    // TODO: more elegant way?
    this.$store.subscribe((mutation) => {
      if (mutation.type === 'clearIO') {
        this.io = []
      }
    })
    engine.on('input', line => this.appendLine(`> ${line}`))
    engine.on('output', line => this.appendLine(line))
  },
  methods: {
    getConsole () {
      return this.$el.querySelector('.console')
    },
    appendLine (line) {
      this.io.push(line)
      this.$nextTick(() => {
        const el = this.getConsole()
        el.scrollTo({
          top: el.scrollHeight,
          behavior: 'auto'
        })
      })
    },
    onKeyup (event) {
      if (event.key === 'Enter') {
        this.$store.dispatch('sendEngineCommand', this.cmd)
        this.cmd = ''
      }
    }
  }
}
</script>

<style scoped>
.container {
  height: 20%;
  display: flex;
  flex-direction: column;
}
.console {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  border: 1px solid #888;
  outline: none;
  border-radius: 3px;
  font-family: monospace;
  font-size: 8pt;
  font-weight: 100;
  text-align: left;
  white-space: nowrap;
  resize: none;
  overflow: scroll;
}
.line {
  margin: 0;
}
</style>
