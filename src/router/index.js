import Vue from 'vue'
import VueRouter from 'vue-router'
import Landing from '../views/Landing.vue'
// import Home from '../views/Home.vue'
// import store from '@/store'

Vue.use(VueRouter)

const routes = [
  // {
  //   path: '/',
  //   name: 'Home',
  //   component: Home
  // },
  {
    path: '/',
    name: 'Landing',
    meta: {
      layout : 'landing_layout',
      requiresAuth: false
    },
    component: Landing
  }
]

const router = new VueRouter({
  routes
})

export default router
