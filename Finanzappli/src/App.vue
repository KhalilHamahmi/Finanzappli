<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from './supabase'

const router = useRouter()
const istEingeloggt = ref(false)

let subscription = null

onMounted(async () => {
  const { data } = await supabase.auth.getSession()
  istEingeloggt.value = !!data.session

  const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
    istEingeloggt.value = !!session
  })
  subscription = listener.subscription
})

onUnmounted(() => {
  subscription?.unsubscribe()
})

const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push('/login')
}
</script>

<template>
  <div class="app">
    <nav class="navbar">
      <router-link to="/" class="brand">
        <span class="brand-name">Finanzappli</span>
      </router-link>

      <div class="nav-links">
        <router-link to="/main">Übersicht</router-link>
        <router-link to="/quiz">Quiz</router-link>
        <router-link to="/investmentrechner">Investment</router-link>
        <router-link to="/grossregionvergleich">Regionen</router-link>
      </div>

      <div class="nav-auth">
        <template v-if="istEingeloggt">
          <button class="btn-primary" @click="handleLogout">Ausloggen</button>
        </template>
        <template v-else>
          <router-link to="/login" class="btn-ghost">Login</router-link>
          <router-link to="/register" class="btn-primary">Registrieren</router-link>
        </template>
      </div>
    </nav>

    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app {
  font-family: Arial, sans-serif;
}

.navbar {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 14px 28px;
  background: #ffffff;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.06);
  position: sticky;
  top: 0;
  z-index: 50;
}

/* Brand */
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.brand-name {
  font-size: 1.15rem;
  font-weight: 700;
  color: #111827;
}

/* Mittlere Links */
.nav-links {
  display: flex;
  gap: 6px;
  margin-left: 8px;
}

.nav-links a {
  padding: 8px 14px;
  border-radius: 10px;
  color: #4b5563;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.nav-links a:hover {
  background: #f3f4f6;
  color: #111827;
}

.nav-links a.router-link-active {
  background: #eff6ff;
  color: #2563eb;
  font-weight: 600;
}

/* Auth-Buttons rechts */
.nav-auth {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

.btn-ghost {
  padding: 8px 16px;
  border-radius: 10px;
  text-decoration: none;
  color: #2563eb;
  font-weight: 600;
  font-size: 0.95rem;
  transition: background 0.2s;
}

.btn-ghost:hover {
  background: #eff6ff;
}

.btn-primary {
  padding: 8px 18px;
  border: none;
  border-radius: 10px;
  text-decoration: none;
  background: #2563eb;
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.content {
  min-height: calc(100vh - 64px);
}

@media (max-width: 720px) {
  .navbar {
    flex-wrap: wrap;
    gap: 12px;
    padding: 12px 16px;
  }
  .nav-auth {
    margin-left: 0;
  }
}
</style>
