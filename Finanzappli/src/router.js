import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import Main from './views/Main.vue'
import Login from './views/Login.vue'
import Register from './views/Register.vue'
import Quiz from './views/quiz.vue'
import grossregionvergleich from "./views/GrossRegionVergleich.vue";
import InvestmentRechner from "./views/InvestmentRechner.vue";
import Tipps from "./views/Tipps.vue";
import { supabase } from './supabase'

const routes = [
    { path: '/', name: 'Home', component: Home },
    { path: '/main', name: 'Main', component: Main, meta: { requiresAuth: true } },
    { path: '/login', name: 'Login', component: Login },
    { path: '/register', name: 'Register', component: Register },
    { path: '/quiz', name: 'Quiz', component: Quiz, meta: { requiresAuth: true } },
    { path: '/grossregionvergleich', name: 'grossregionvergleich', component: grossregionvergleich, meta: { requiresAuth: true } },
    { path: '/investmentrechner', name: 'InvestmentRechner', component: InvestmentRechner, meta: { requiresAuth: true } },
    { path: '/tipps', name: 'Tipps', component: Tipps, meta: { requiresAuth: true } },

]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach(async (to) => {
    if (!to.meta.requiresAuth) return true

    const { data } = await supabase.auth.getSession()
    if (data.session) return true

    return { path: '/login' }
})

export default router