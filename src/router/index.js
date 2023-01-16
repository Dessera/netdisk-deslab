import Vue from 'vue'
import VueRouter from 'vue-router'
import LoginPage from '@/views/LoginPage.vue'
import HomePage from '@/views/HomePage.vue'
import Files from '@/components/Main/Files.vue'
import Setting from '@/components/Main/Setting.vue'
import About from '@/components/Main/About.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  }, {
    path: '/login',
    component: LoginPage
  }, {
    path: '/home',
    component: HomePage,
    redirect: '/home/files',
    children: [
      {
        name: 'Files',
        path: 'files',
        component: Files
      }, {
        name: 'Setting',
        path: 'setting',
        component: Setting
      }, {
        name: 'About',
        path: 'about',
        component: About
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

export default router
