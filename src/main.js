import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'

// Suppress prod tips/warnings on dev startup
Vue.config.productionTip = false

// Import Layouts
Vue.component("landing_layout", () => import("@/layouts/landingLayout/index"));
Vue.component("logged_in_layout", () => import("@/layouts/loggedInLayout/index"));

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
