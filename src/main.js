import Vue from 'vue'
import App from './App.vue'
//import Chat from './components/vue-beautiful-chat.umd.min.js'
import Chat from '../vue_chat_plugin/Chat_plugin.js'
import vmodal from 'vue-js-modal'
Vue.config.productionTip = false
Vue.use(Chat)
Vue.use(vmodal)

new Vue({
  render: h => h(App),
}).$mount('#app')
