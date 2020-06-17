import Vue from 'vue'
import App from './App.vue'
import Chat from './Chat_plugin.js'
import vmodal from 'vue-js-modal'
Vue.config.productionTip = false
Vue.use(Chat)
Vue.use(vmodal)

new Vue({
  render: h => h(App),
}).$mount('#app')
