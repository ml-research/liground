<template>
  <div class="ceval float-left-child">
    {{ eval }}
  </div>
</template>

<script>
export default {
  name: 'LiveEval',
  computed: {
    eval: function () {
      return this.$store.getters.cpForWhiteStr
    }
  }
}
</script>

<style scoped>
.ceval {
  width: 90px;
  height: 50px;
  font-size: 25pt;
  margin-left: -12px;
  margin-right: 5px;
  margin-top: 15px;
}
</style>
