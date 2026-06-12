<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'

const router = useRouter()

const username = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')

const handleRegister = async () => {

  if (password.value !== passwordConfirm.value) {
    alert("Die Passwörter stimmen nicht überein.")
    return
  }

  const { data, error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
  })

  if (error) {
    alert(error.message)
    return
  }

  const { error: dbError } = await supabase
      .from('Benutzer')
      .insert([
        {
          auth_id: data.user.id,
          username: username.value,
          email: email.value,
        }
      ])

  if (dbError) {
    alert(dbError.message)
    return
  }

  router.push('/login')
}
</script>

<template>
  <div class="register-container">

    <div class="register-card">

      <h1>Registrieren</h1>

      <p class="subtitle">
        Erstelle dein Finanzappli Konto
      </p>

      <form @submit.prevent="handleRegister">

        <div class="input-group">
          <label>Benutzername</label>
          <input type="text" v-model="username" placeholder="Benutzername eingeben" />
        </div>

        <div class="input-group">
          <label>E-Mail</label>
          <input type="email" v-model="email" placeholder="E-Mail eingeben" />
        </div>

        <div class="input-group">
          <label>Passwort</label>
          <input type="password" v-model="password" placeholder="Passwort eingeben" />
        </div>

        <div class="input-group">
          <label>Passwort wiederholen</label>
          <input type="password" v-model="passwordConfirm" placeholder="Passwort wiederholen" />
        </div>

        <button type="submit">
          Registrieren
        </button>

        <button
            type="button"
            style="margin-top: 15px;"
            @click="router.push('/login')"
        >
          Bereits ein Konto? Anmelden
        </button>
      </form>

    </div>

  </div>
</template>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f3f4f6;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.register-card {
  background: white;
  padding: 40px;
  border-radius: 18px;
  width: 100%;
  max-width: 420px;
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
</style>