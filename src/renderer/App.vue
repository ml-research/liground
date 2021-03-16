<template>
  <div id="app">
    <RouterView />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
@import "../../node_modules/vue-multiselect/dist/vue-multiselect.min.css";
@import '../../node_modules/pretty-checkbox/dist/pretty-checkbox.css';
@import './assets/mdi-icons/materialdesignicons.min.css';
@import '~vue-context/dist/css/vue-context.css';

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
