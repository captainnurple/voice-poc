import Vue from 'vue'
import VueRouter from 'vue-router'
import Landing from '../views/Landing.vue'
// import Home from '../views/Home.vue'
import store from '@/store'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Landing',
    meta: {
      layout : 'landing_layout',
      requiresAuth: false
    },
    component: Landing
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    meta: {
      layout: "logged_in_layout",
      requiresAuth: true
    },
    component: () => import(/* webpackChunkName: "dashboard" */ '../views/Dashboard.vue'),
  },
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const isLoggedIn = store.getters['user/getUserStatus'];
    if (process.env.NODE_ENV !== 'production') {
      console.log(`isLoggedIn : ${isLoggedIn}`)
    }
    // this route requires auth, check if logged in
    // if not, redirect to landing page.
    if (!isLoggedIn) {
      next({
        path: '/',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    next() // make sure to always call next()!
  }
})

export default router
