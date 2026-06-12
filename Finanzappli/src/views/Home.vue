<script setup>
import { useRouter } from "vue-router";
import { computed, reactive, onMounted, ref } from "vue";

const showModal = ref(false);

function Popup() {
  showModal.value = !showModal.value;
}

const router = useRouter();

const goToRegister = () => {
  router.push("/register");
};
</script>

<template>
  <div class="home-container">

    <section class="hero">
      <h1>Willkommen bei Finanzappli</h1>

      <p class="subtitle">
        Verwalte deine Finanzen einfach, modern und übersichtlich.
      </p>

      <button class="start-btn" @click="goToRegister">
        Jetzt starten
      </button>
    </section>

    <section class="features">

      <div class="card">
        <h2>Ausgaben tracken</h2>
        <p>Behalte alle deine täglichen Ausgaben im Blick.</p>
      </div>

      <div class="card">
        <h2>Budget planen</h2>
        <p>Erstelle Budgets und erreiche deine Sparziele.</p>
      </div>

      <div class="card">
        <h2>Statistiken</h2>
        <p>Analysiere deine Finanzen mit klaren Übersichten.</p>
      </div>

    </section>

  </div>
</template>

<style scoped>
.home-container {
  min-height: 100vh;
  background: #f3f4f6;
  padding: 40px 20px;
  font-family: Arial, sans-serif;
}

.hero {
  text-align: center;
  margin-bottom: 60px;
}

h1 {
  font-size: 3rem;
  color: #111827;
  margin-bottom: 15px;
}

.subtitle {
  font-size: 1.2rem;
  color: #4b5563;
  margin-bottom: 30px;
}

.start-btn {
  background: #eb6425;
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  transition: 0.2s;
}

.start-btn:hover {
  background: #d86b1d;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.card {
  background: white;
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.08);
}

.card h2 {
  color: #111827;
  margin-bottom: 10px;
}

.card p {
  color: #6b7280;
}
</style>