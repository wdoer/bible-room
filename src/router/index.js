import Vue from 'vue'
import VueRouter from 'vue-router'

import ViewerPage from '../views/ViewerPage'
import PanelPage from '../views/PanelPage'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'ViewerPage',
    component: ViewerPage
  },
  {
    path: '/panel/',
    name: 'PanelPage',
    component: PanelPage
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
