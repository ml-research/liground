<template>
  <div class="container">
    <div class="eval">
      {{ eval }}
    </div>
    <div
      class="banner"
      :style="{ backgroundImage: `url(${engineBannerURL})` }"
    />
    <Multiselect
      v-model="selected"
      class="multiselect"
      :options="options"
      :allow-empty="false"
      :show-labels="false"
      placeholder="Select Engine"
    />
    <RoundedSwitch class="switch" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import RoundedSwitch from './RoundedSwitch.vue'
import Multiselect from 'vue-multiselect'

export default {
  name: 'AnalysisEvalRow',
  components: {
    RoundedSwitch,
    Multiselect
  },
  data () {
    return {
      selected: '' // this will be set on created
    }
  },
  computed: {
    engineBannerURL () {
      // TODO: base64 instead of url to allow custom logos for user engines?
      const selected = this.getSelectedEngine()
      return selected ? selected.logo : ''
    },
    options () {
      return this.engines.map(e => e.name)
    },
    engines () {
      return this.allEngines.filter(e => e.variants && e.variants.includes(this.variant))
    },
    ...mapGetters({
      variant: 'variant',
      allEngines: 'availableEngines',
      eval: 'cpForWhiteStr'
    })
  },
  watch: {
    selected () {
      this.$store.dispatch('engineBinary', this.getSelectedEngine().binary)
    },
    variant () {
      // TODO: save previous user selection per variant?
      this.selectDefault()
    }
  },
  created () {
    this.selectDefault()
  },
  methods: {
    getSelectedEngine () {
      return this.engines.find(e => e.name === this.selected)
    },
    selectDefault () {
      // first engine in the list has highest priority
      this.selected = this.engines[0].name
    }
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

.banner {
  width: 120px;
  height: 60px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 5px;
  flex-basis: 120px;
  flex-shrink: 0;
  flex-grow: 0;
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
