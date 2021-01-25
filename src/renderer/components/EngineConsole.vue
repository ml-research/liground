<template>
  <div class="container">
    <div class="console">
      <!-- TODO: use lazy loading/rendering for console? this can get pretty large! -->
      <div
        v-for="(line, i) in engineIO"
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
import { mapGetters } from 'vuex'

export default {
  name: 'EngineConsole',
  data () {
    return { cmd: '' }
  },
  computed: {
    ...mapGetters(['engineIO'])
  },
  watch: {
    engineIO () {
      // enqueue scroll for next tick
      this.$nextTick(() => {
        const el = this.$el.querySelector('.console')
        el.scrollTo({
          top: el.scrollHeight,
          behavior: 'smooth'
        })
      })
    }
  },
  methods: {
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
  flex-grow: 1;
  flex-direction: column;
  border: 1px solid #888;
  border-radius: 3px;
  font-family: monospace;
  font-weight: 100;
  font-size: 8pt;
  overflow: scroll;
  white-space: nowrap;
  text-align: left;
}
.line {
  margin: 0;
}
.input {

}
</style>
