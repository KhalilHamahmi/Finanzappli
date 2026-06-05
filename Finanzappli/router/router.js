import { createRouter, createWebHistory } from 'vue-router'
import Home from '../src/views/Home.vue'
import Main from '../src/views/Main.vue'
import Login from '../src/views/Login.vue'
import Register from '../src/views/Register.vue'
import quiz from '../src/views/quiz.vue'

const routes = [
  {
      path: '/',
      name: 'Home',
      component: Home
  },
  {
      path: '/main',
      name: 'Main',
      component: Main
  },
  {
      path: '/register',
      name: 'Register',
      component: Register
  },
  {
      path: '/login',
      name: 'Login',
      component: Login
  },
  {
      path: '/quiz',
      name: 'Quiz',
      component: quiz
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
