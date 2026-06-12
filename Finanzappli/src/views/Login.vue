<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'

const router = useRouter()

const email = ref('')
const password = ref('')
const fehler = ref('')

const handleLogin = async () => {
  fehler.value = ''

  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })

  if (error) {
    if (/Invalid login credentials/i.test(error.message)) {
      fehler.value = 'E-Mail oder Passwort ist falsch.'
    } else {
      fehler.value = error.message
    }
    return
  }

  router.push('/quiz')
}
</script>

<template>
  <div class="login-container">

    <div class="login-card">

      <h1>Login</h1>

      <p class="subtitle">
        Willkommen zurück bei Finanzappli
      </p>

      <form @submit.prevent="handleLogin">

        <div class="input-group">
          <label>E-Mail</label>
          <input type="email" v-model="email" placeholder="E-Mail eingeben" />
        </div>

        <div class="input-group">
          <label>Passwort</label>
          <input type="password" v-model="password" placeholder="Passwort eingeben" />
        </div>

        <p v-if="fehler" class="error-box">{{ fehler }}</p>

        <button type="submit">
          Anmelden
        </button>

        <button
            type="button"
            style="margin-top:15px"
            @click="$router.push('/register')"
        >
          Noch kein Konto?
        </button>

      </form>

    </div>

  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f3f4f6;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 18px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  color: #111827;
  margin-bottom: 10px;
}

.subtitle {
  text-align: center;
  color: #6b7280;
  margin-bottom: 30px;
}

.input-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #374151;
  font-weight: 600;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 1rem;
  outline: none;
  transition: 0.2s;
  box-sizing: border-box;
}

input:focus {
  border-color: #2563eb;
}

button {
  width: 100%;
  padding: 14px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  transition: 0.2s;
}

button:hover {
  background: #1d4ed8;
}

.error-box {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
  border-radius: 10px;
  padding: 12px 14px;
  margin-bottom: 16px;
  font-size: 0.9rem;
  font-weight: 500;
  text-align: center;
}
</style>