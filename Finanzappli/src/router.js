import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import Main from './views/Main.vue'
import Login from './views/Login.vue'
import Register from './views/Register.vue'
import Quiz from './views/quiz.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/main', name: 'Main', component: Main },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/quiz', name: 'Quiz', component: Quiz },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
