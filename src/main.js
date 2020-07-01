import Vue from 'vue'
import App from './App.vue'
import router from './router'
import VTooltip from 'v-tooltip'
import vmodal from 'vue-js-modal'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import drag from './vue_chat_plugin/vue.drag.js'
import config from './config'

Vue.config.productionTip = false

Vue.use(vmodal)
Vue.use(ElementUI)
Vue.use(VTooltip)

Vue.directive("drag", drag);

Vue.prototype.$WS_URL = config.WS_URL;
console.log("config",config);


new Vue({
  router,
  render: h => h(App),
}).$mount('#app');
