<template>
  <div class="login-container">

    <div class="login-card">

      <h1>Login</h1>

      <p class="subtitle">
        Willkommen zurück bei Finanzappli
      </p>

      <form @submit.prevent>

        <div class="input-group">
          <label>Benutzername</label>
          <input type="text" placeholder="Benutzername eingeben" />
        </div>

        <div class="input-group">
          <label>Passwort</label>
          <input type="password" placeholder="Passwort eingeben" />
        </div>

        <button type="submit">
          Anmelden
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
</style>