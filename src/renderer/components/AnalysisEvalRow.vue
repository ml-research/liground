<template>
  <div
    class="wrapper template grid-parent"
    :style="{'text-align': align}"
  >
    <LiveEval />
    <div
      class="engine-banner"
      :style="{ backgroundImage: 'url(' + require('../assets/images/engines/'+engineBannerURL) + ')' }"
    />
    <multiselect
      v-model="selected"
      class="multiselect"
      :options="options"
      :allow-empty="false"
      :show-labels="false"
      :placeholder="selected"
    />
    <RoundedSwitch id="switch" />
  </div>
</template>

<script scoped>
import LiveEval from './LiveEval.vue'
import RoundedSwitch from './RoundedSwitch.vue'
import Multiselect from 'vue-multiselect'

export default {
  name: 'AnalysisEvalRow',
  components: {
    LiveEval,
    RoundedSwitch,
    Multiselect
  },
  props: {
    clearOnSelect: {
      type: Boolean,
      default: false
    },
    time: {
      type: Number,
      default: 0
    },
    name: {
      type: String,
      default: 'Multi-Variant Stockfish 10 🐟'
    },
    onMove: {
      type: Boolean,
      default: false
    },
    align: {
      type: String,
      default: 'left'
    }
  },
  data () {
    return {
      engines:
      {
        chess: [
          'Multi-Variant Stockfish 10',
          'ClassicAra 0.8.1'
        ],
        crazyhouse: [
          'Multi-Variant Stockfish 10',
          'CrazyAra 0.8.1'
        ]
      },
      options: [
        'Multi-Variant Stockfish 10',
        'CrazyAra 0.8.1'
      ],
      selected: 'Multi-Variant Stockfish 10',
      engineBinaries: {
        'Multi-Variant Stockfish 10': 'stockfish',
        'CrazyAra 0.8.1': 'CrazyAra',
        'ClassicAra 0.8.1': 'ClassicAra'
      },
      imageUrl: 'Stockfish.png',
      engineBanners: {
        'Multi-Variant Stockfish 10': 'stockfish_transp.png',
        'CrazyAra 0.8.1': 'crazyara_logo_small_artwork.png',
        'ClassicAra 0.8.1': 'crazyara_logo_small_artwork.png'
      }
    }
  },
  computed: {
    variant () {
      return this.$store.getters.variant
    },
    engineBannerURL () {
      return this.engineBanners[this.selected]
    }
  },
  watch: {
    /* variant: function (variant) {
      console.log(`variant: ${variant}`)
      this.options = this.engines[variant]
    }, */
    selected: function () {
      this.$store.dispatch('started', false)
      this.$store.dispatch('selected', false)
      console.log(`engineBinary: ${this.engineBinaries[this.selected]}`)
      this.$store.dispatch('engineBinary', this.engineBinaries[this.selected])
    }
  },
  methods: {
    methodToRunOnSelect (payload) {
      console.log(payload)
    }
  }
}
</script>

<style scoped>
.wrapper {
  text-align: center;
  padding: 1.05em 0em;
  width: 600px;
}

.clock-border {
  border-radius: 1px;
  text-align: center;
  padding: 4px;
  color: black;
  font-weight: 800;
  display: inline-block;
  min-width: 4em;
}

.name {
  padding: 0em 1em;
  display: inline-block;
  font-style: italic;
}

.analyse__tools,
#modal-wrap .close:hover {
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
}

SimpleDropdown {
  min-width: 80px;
}

.form-group {
  font-size: 10px;
}

.template {
  border-radius: 3px 3px 3px 3px;
  border-color: #222;
  border-width: 1px;
}

.grid-parent {
  display: grid;
  padding-left: 20px;
  padding-bottom: 30px;
  align-items: center;
  grid-template-columns: auto auto auto auto
}

.multiselect {
  width: 300px;
}
.engine-banner {
  border-radius: 5px;
  border-width: 1px;
  width: 120px;
  height: 60px;
  background-size: 120px 60px;
  background-repeat: no-repeat;
}
</style>
