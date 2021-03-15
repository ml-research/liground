<template>
  <div class="container">
    <div class="eval">
      {{ cpForWhiteStr }}
    </div>
    <div
      class="logo"
    >
      <div
        class="image"
        :style="{ backgroundImage: engineLogo }"
      />
    </div>
    <Multiselect
      v-model="selected"
      class="multiselect"
      :placeholder="selected.name"
      label="name"
      track-by="name"
      :options="availableEngines"
      :allow-empty="false"
      :show-labels="false"
    />
    <RoundedSwitch class="switch" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import RoundedSwitch from './RoundedSwitch.vue'
import Multiselect from 'vue-multiselect'
import defaultLogo from '../assets/images/engines/chess_engine.svg'

export default {
  name: 'AnalysisEvalRow',
  components: {
    RoundedSwitch,
    Multiselect
  },
  data () {
    return {
      selected: null // this will be set on created
    }
  },
  computed: {
    engineLogo () {
      return `url(${this.selectedEngine.logo || defaultLogo})`
    },
    ...mapGetters(['availableEngines', 'selectedEngine', 'cpForWhiteStr'])
  },
  watch: {
    selected () {
      this.$store.dispatch('changeEngine', this.selected.name)
    },
    selectedEngine () {
      this.selected = this.selectedEngine
    }
  },
  created () {
    this.selected = this.selectedEngine
  }
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: stretch;
  margin: 10px 0;
  border-radius: 3px;
  text-align: center;
}
.container > * {
  margin: 0 5px;
}

.eval {
  font-size: 2em;
}

.logo {
  border-radius: 5px;
  flex-basis: 120px;
  flex-shrink: 0;
  flex-grow: 0;
}
.logo .image {
  width: 120px;
  height: 60px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
}

.multiselect {
  flex-basis: auto;
  flex-shrink: 1;
  flex-grow: 1;
}

.switch {
  flex-basis: 60px;
  flex-shrink: 0;
  flex-grow: 0;
}

</style>
