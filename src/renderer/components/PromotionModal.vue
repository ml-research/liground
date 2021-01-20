<template>
  <div
    class="prom-container"
  >
    <template v-for="piece in promOptions">
      <option
      :key="piece.type"
      v-bind:class="[piece.type, turn]"
      @click="close(piece.type)"
      />
    </template>
  </div>
</template>

<script>
export default {
  name: 'PromotionModal',
  props:{
    promOptions: {
      type: Array,
      default: () => ([
        {type: 'queen'},
        {type: 'rook'},
        {type: 'bishop'},
        {type: 'knight'},
      ])
    },
    turn: {
      type: String,
      default: 'white'
    }
    
  },
  data () {
    return {
      promDir: { 'queen':'q', 'rook': 'r', 'bishop':'b', 'knight':'n'}
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
   option {
    background-size: cover;
    width: 100%;
    background-color: white;
  }
  option:hover {
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
