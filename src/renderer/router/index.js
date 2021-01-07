import Vue from 'vue'
import Router from 'vue-router'
import LPE from 'D:/Dokumente/Studium/BP/liground/src/renderer/components/LPE.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'landing-page',
      component: require('@/components/LandingPage').default
    },
    {
      path: 'D:/Dokumente/Studium/BP/liground/src/renderer/components/MenuEngines.vue',
      name: 'LPE',
      component: LPE.Vue
    }
    /* {
      path: '*',
      redirect: '/'
    } */
  ]
})
