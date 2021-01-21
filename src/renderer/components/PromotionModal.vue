<template>
  <div
    class="prom-container"
    @click="close(piece.type)"
  >
    <li v-for="piece in promOptions"
    :key="piece.id"
    :class="[piece.type, side, pieceoption]"
    @click="close(piece.type)"
    >
    </li>
  </div>
</template>

<script>
export default {
  name: 'PromotionModal',
  props:{
    promotions: {
      type: Array,
    },
  },
  data () {
    return {
      promDir: { 'queen':'q', 'rook': 'r', 'bishop':'b', 'knight':'n', 'pawn': 'p' , 'ppawn': 'p+'},
      promOptions: this.promotions,
    }
  },
  computed: {
    side () {
      return this.$store.getters.turn ? 'white' : 'black'
    }
  },
  
  methods: {
    close (value) {
      this.$emit('close', this.promDir[value])
    }
  }
}

</script>

<style scoped>
   .pieceoption {
    background-size: cover;
    width: 100%;
    background-color: white;
  }
  .pieceoption:hover {
    background-color: rgb(182, 155, 107);
  }

  .prom-container{
    box-shadow: 0 0 10px black;
    display: grid;
    grid-template-rows: repeat(4, 1fr);
    height: 100%;
  }
  .prom-container:hover {
    cursor: pointer;
  }
  .promOptionB1 {
    background-image: url('../assets/images/pieces/merida/bQ.svg');
    order: 4;
  }
  .promOptionB2 {
    background-image: url('../assets/images/pieces/merida/bN.svg');
    order: 3;
  }
  .promOptionB3 {
    background-image: url('../assets/images/pieces/merida/bR.svg');
    order: 2;
  }
  .promOptionB4 {
    background-image: url('../assets/images/pieces/merida/bB.svg');
    order: 1;
  }
  .promOptionW1 {
    background-image: url('../assets/images/pieces/merida/wQ.svg');
    order: 1;
  }
  .promOptionW2 {
    background-image: url('../assets/images/pieces/merida/wN.svg');
    order: 2;
  }
  .promOptionW3 {
    background-image: url('../assets/images/pieces/merida/wR.svg');
    order: 3;
  }
  .promOptionW4 {
    background-image: url('../assets/images/pieces/merida/wB.svg');
    order: 4;
  }

</style>
