import Vue from 'vue'
import App from './App.vue'
import router from './router'
//import Chat from '../vue_chat_plugin/index.js'
import VTooltip from 'v-tooltip'
import vmodal from 'vue-js-modal'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.config.productionTip = false
//Vue.use(Chat)
Vue.use(vmodal)
Vue.use(VTooltip)
Vue.use(ElementUI)

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');
