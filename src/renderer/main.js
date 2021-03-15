import Vue from 'vue'

import App from './App'
import router from './router'
import { store } from './store'

/* vue based event bus */
export const bus = new Vue()

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
