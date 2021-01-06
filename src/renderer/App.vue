<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'Liground'
}
</script>

<style>
@import "../../node_modules/vue-multiselect/dist/vue-multiselect.min.css";
@import '../../node_modules/pretty-checkbox/dist/pretty-checkbox.css';
@import '../../node_modules/vue-material-design-icons/styles.css';
@import 'https://cdn.materialdesignicons.com/5.3.45/css/materialdesignicons.min.css';

@font-face {
  font-family: "Noto Chess";
  src: url('assets/fonts/lichess.chess.woff2');
}

.float-right-child {
  float: right;
}
.float-left-child {
  float: left;
}
.noselect {
  /* https://stackoverflow.com/questions/826782/how-to-disable-text-selection-highlighting */
  -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
     -khtml-user-select: none; /* Konqueror HTML */
       -moz-user-select: none; /* Old versions of Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
            user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome, Edge, Opera and Firefox */
}
</style>
