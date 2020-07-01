import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/view/chat'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'index',
      component: Index
    },
    // {
    //   path: '/record/:id',
    //   name: 'record',
    //   component: Record
    // },
    // {
    //   path: '/conservation',
    //   name: 'conservation',
    //   component: Conservation
    // },
    // {
    //   path: '/log',
    //   name: 'log',
    //   component: Log
    // },
    // {
    //   path: '*',
    //   name: 'error',
    //   component: Error
    // }
  ]
})
