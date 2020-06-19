import Vue from 'vue'
import App from './App.vue'
//import Chat from '../vue_chat_plugin/index.js'
import VTooltip from 'v-tooltip'
import vmodal from 'vue-js-modal'
Vue.config.productionTip = false
//Vue.use(Chat)
Vue.use(vmodal)
Vue.use(VTooltip)

new Vue({
  render: h => h(App),
}).$mount('#app');
