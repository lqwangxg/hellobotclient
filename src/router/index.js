import Vue from 'vue'
import Router from 'vue-router'
import chat from '@/view/chat'
import mmc from '@/view/mmc'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'index',
      component: chat
    },
    {
      path: '/auth',
      name: 'auth',
      component: mmc
    },
    {
      path: '/mmc',
      name: 'mmc',
      component: mmc
    },
    {
      path: '/user/',
      name: 'user',
      component: chat
    },
    {
      path: '/:username',
      name: 'user',
      component: chat
    },
    {
      path: '/user/:username',
      name: 'user',
      component: chat
    }
  ]
})
