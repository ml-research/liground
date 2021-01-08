<template>
  <a> {{ game ? game.headers("White") : '' }} vs {{ game ? game.headers("Black") : '' }} </a>
</template>

<script>
export default {
  name: 'PgnBrowserOption',
  props: {
    game: {
      type: Object,
      default: undefined
    }
  }
}
</script>

<style scoped>

</style>
