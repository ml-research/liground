<template>
  <div class="bar">
    <div
      class="item"
      :class="{ active: !viewAnalysis }"
      @click="changeTab"
    >
      <em class="icon mdi mdi-hammer-screwdriver" /> Settings
    </div>
    <div
      class="item"
      @click="openAboutTabModal"
    >
      <em class="icon mdi mdi-information-outline" /> About <em class="icon mdi mdi-github" />
    </div>
    <AboutTabModal
      v-if="modal.visible"
      :title="modal.title"
      @close="modal.visible = false"
    />
  </div>
</template>

<script>
import fs from 'fs'
import { mapGetters } from 'vuex'
import ffish from 'ffish'
import AboutTabModal from './AboutTabModal'

export default {
  name: 'MenuBar',
  components: { AboutTabModal },
  data () {
    return {
      modal: {
        visible: false,
        title: '',
        save: () => {}
      }
    }
  },
  computed: {
    ...mapGetters(['viewAnalysis', 'variantOptions'])
  },
  methods: {
    changeTab () {
      this.$store.commit('viewAnalysis', !this.viewAnalysis)
    },
    openAboutTabModal () {
      this.modal = {
        visible: true,
        title: 'LiGround'
      }
    },
  }
}
</script>

<style scoped>
.bar {
  margin: 10px auto;
  position: relative;
  background-color: var(--button-color);
  font-size: 11px;
  width: 33.3%;
  border-radius: 8px;
}
.item {
  padding-left: 16px;
  padding-right: 16px;
  padding-top: 1.5%;
  padding-bottom: 1.5%;
  display: inline-block;
  color: var(--light-text-color);;
  font-size: 11px;
  text-decoration: none;
  text-align: center;
  cursor: pointer;
}
.item:hover {
  background-color: var(--hover-color);
}
.item.active {
  background-color: var(--menubar-activetab-color);
}
</style>
