<template>
  <div
    class="prom-container"
  >
    <div
      id="op1"
      class="prom-option"
      :class="[ turn ? 'promOptionW1' : 'promOptionB4']"
      @click="close('1')"
    />
    <div
      id="op2"
      class="prom-option"
      :class="[ turn ? 'promOptionW2' : 'promOptionB3']"
      @click="close('2')"
    />
    <div
      id="op3"
      class="prom-option"
      :class="[ turn ? 'promOptionW3' : 'promOptionB2']"
      @click="close('3')"
    />
    <div
      id="op4"
      class="prom-option"
      :class="[ turn ? 'promOptionW4' : 'promOptionB1']"
      @click="close('4')"
    />
  </div>
</template>

<script>
export default {
  name: 'PromotionModal',
  data () {
    return {
      promDir: { 1: 'q', 2: 'n', 3: 'r', 4: 'b' }
    }
  },
  computed: {
    pieceStyle () {
      return this.$store.getters.pieceStyle
    },
    turn () {
      return this.$store.getters.turn
    },
    orientation () {
      return this.$store.getters.orientation
    }
  },
  created () {
    document.addEventListener('renderPromotion', () => {
      this.main()
    })
  },
  methods: {
    main () {
      this.loadPieceStyle()
      this.orderPieces()
    },
    orderPieces () {
      if (this.orientation === 'white') {
        document.getElementById('op1').style.order = '1'
        document.getElementById('op2').style.order = '2'
        document.getElementById('op3').style.order = '3'
        document.getElementById('op4').style.order = '4'
      } else {
        document.getElementById('op1').style.order = '4'
        document.getElementById('op2').style.order = '3'
        document.getElementById('op3').style.order = '2'
        document.getElementById('op4').style.order = '1'
      }
    },
    loadPieceStyle () {
      // document.getElementById('op1').style.backgroundImage = "url('src/renderer/assets/piece/international/" + this.pieceStyle + "/wQ.svg)"
    },
    close (value) {
      if (this.turn) {
        this.$emit('close', this.promDir[value])
      } else {
        this.$emit('close', this.promDir[5 - value])
      }
    }
  }
}
</script>

<style scoped>
  .prom-option {
    background-size: cover;
    width: 100%;
    background-color: white;
  }
  .prom-option:hover {
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
