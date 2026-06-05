<template>
  <div>
    <nav style="padding:1em;background:#f5f5f5">
      <router-link to="/">Home</router-link> |
      <router-link to="/main">Main</router-link> |
      <router-link to="/quiz">Quiz</router-link> |
      <router-link to="/login">Login</router-link> |
      <router-link to="/register">Registrieren</router-link>|
      <router-link to="/grossregionvergleich">GrossRegionenvergleich</router-link>|
    </nav>
    <main style="padding:1em">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
nav a {
  margin-right: .5rem;
  color: #3b82f6;
  text-decoration: none;
}
nav a.router-link-active {
  font-weight: 600;
}
</style>
