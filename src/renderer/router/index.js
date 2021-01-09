import Vue from 'vue'
import Router from 'vue-router'
import NewTab from 'D:/Dokumente/Studium/BP/liground/src/renderer/components/NewTab.vue'

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
      name: 'NewTab',
      component: NewTab.Vue
    }
    /* {
      path: '*',
      redirect: '/'
    } */
  ]
})
