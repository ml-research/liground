<template>
  <div
    class="progress"
    :class="{ transform : $store.getters.orientation == 'black' }"
  >
    <div
      class="progress-value"
      :style="{ height: filterSectionHeight }"
    />
  </div>
</template>

<script>
export default {
  name: 'EvalBar',
  computed: {
    filterSectionHeight () {
      return String(this.$store.getters.cpforWhitePerc * 600) + 'px'
    }
  }
}
</script>

<style lang="css">

.progress {
  background: #111;
  justify-content: flex-start;
  border-radius: 5px 5px 5px 5px;
  border-color: #222;
  border-width: 1.5px;
  border-style: solid;
  position: relative;
  padding: 0 0px;
  display: flex;
  height: 600px;
  width: 17px;
}
.transform {
  transform: scaleY(-1);
}

.progress-value {
  box-shadow: 0 10px 40px -10px #333;
  border-radius: 0px 0px 5px 5px;
  background: #fff;
  width: 17px;
  height: 0px;
  position: absolute;
  bottom: 0;
}

@keyframes load {
  0% { height: 0; }
  100% { height: 50%; }
}
</style>
