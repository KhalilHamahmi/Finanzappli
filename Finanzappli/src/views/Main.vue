<script setup>
import { computed, reactive, onMounted, ref } from "vue";
import { supabase } from "../supabase";

const loading = ref(true);
const fehler = ref(null);
const benutzerId = ref(null);

const newCategory = ref("");
const newAmount = ref(0);
const newDescription = ref("");

const kategorienOptionen = [
  "Wohnen",
  "Lebensmittel",
  "Transport",
  "Freizeit",
  "Gesundheit",
  "Kleidung",
  "Restaurant",
  "Sonstiges",
];

const budget = reactive({
  income: 0,
  budgetId: null,
  categories: []
});

const transaktionen = ref([]);

const aktuellerMonat = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

async function ladeDaten() {
  loading.value = true;
  fehler.value = null;

  // 1. Eingeloggten Benutzer holen
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    fehler.value = "Nicht eingeloggt.";
    loading.value = false;
    return;
  }

  // 2. Benutzer-Zeile anhand auth_id finden
  const { data: benutzer, error: benutzerError } = await supabase
      .from("Benutzer")
      .select("id")
      .eq("auth_id", authData.user.id)
      .single();

  if (benutzerError || !benutzer) {
    fehler.value = "Benutzer nicht gefunden.";
    loading.value = false;
    return;
  }

  benutzerId.value = benutzer.id;

  // 3. Budget für aktuellen Monat holen
  const monat = aktuellerMonat();
  const { data: budgetData, error: budgetError } = await supabase
      .from("Budget")
      .select("id, einkommen, ausgaben")
      .eq("benutzer_id", benutzer.id)
      .eq("monat", monat)
      .maybeSingle();

  if (budgetError) {
    fehler.value = budgetError.message;
    loading.value = false;
    return;
  }

  if (budgetData) {
    budget.income = Number(budgetData.einkommen) || 0;
    budget.budgetId = budgetData.id;
  } else {
    // Kein Budget für diesen Monat -> anlegen
    const { data: neuesBudget, error: insertBudgetError } = await supabase
        .from("Budget")
        .insert([{ monat, benutzer_id: benutzer.id, einkommen: 0, ausgaben: 0 }])
        .select("id, einkommen")
        .single();

    if (insertBudgetError) {
      fehler.value = insertBudgetError.message;
      loading.value = false;
      return;
    }

    budget.income = 0;
    budget.budgetId = neuesBudget.id;
  }

  // 4. Transaktionen für diesen Benutzer/Monat holen
  const { data: transData, error: transError } = await supabase
      .from("Transaktion")
      .select("id, betrag, kategorie, typ, datum")
      .eq("benutzer_id", benutzer.id)
      .gte("datum", `${monat}-01`)
      .order("datum", { ascending: false });

  if (transError) {
    fehler.value = transError.message;
    loading.value = false;
    return;
  }

  transaktionen.value = transData;

  // 5. Kategorien aus Transaktionen gruppieren (nur Ausgaben)
  const gruppiert = {};
  for (const t of transData) {
    if (t.typ === "ausgabe") {
      gruppiert[t.kategorie] = (gruppiert[t.kategorie] || 0) + Number(t.betrag);
    }
  }

  budget.categories = Object.entries(gruppiert).map(([label, amount]) => ({
    label,
    amount,
    color: getRandomColor()
  }));

  loading.value = false;
}

onMounted(() => {
  ladeDaten();
});

const totalExpenses = computed(() => budget.categories.reduce((sum, item) => sum + item.amount, 0));
const remainingAmount = computed(() => budget.income - totalExpenses.value);
const remainingPercent = computed(() => {
  if (budget.income === 0) return 0;
  return Math.max(0, Math.min(100, (remainingAmount.value / budget.income) * 100));
});

const categorySlices = computed(() => {
  const total = totalExpenses.value || 1;
  let current = 0;
  return budget.categories.map((item) => {
    const percent = (item.amount / total) * 100;
    const slice = {
      ...item,
      percent: Math.round(percent * 10) / 10,
      start: current
    };
    current += percent;
    return slice;
  });
});

const pieStyle = computed(() => ({
  backgroundImage: `conic-gradient(${categorySlices.value
      .map((slice) => `${slice.color} ${slice.start}% ${slice.start + slice.percent}%`)
      .join(", ")})`
}));

const budgetStyle = computed(() => {
  const spentPercent = Math.min(100, Math.round((totalExpenses.value / (budget.income || 1)) * 10000) / 100);
  const usedColor = remainingAmount.value < 0 ? "#ef4444" : "#3b82f6";
  const freeColor = remainingAmount.value < 0 ? "#9ca3af" : "#22c55e";
  return {
    backgroundImage: `conic-gradient(${usedColor} 0 ${spentPercent}%, ${freeColor} ${spentPercent}% 100%)`
  };
});

const formatCHF = (value) =>
    new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
      maximumFractionDigits: 2
    }).format(value);

function getRandomColor() {
  const colors = [
    "#22c55e",
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#14b8a6",
    "#f97316"
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function Popup() {
  const modal = document.getElementById("myPopup");
  if (modal) modal.classList.toggle("show");
}

async function transaktionHinzufuegen() {
  if (!newCategory.value || !newAmount.value) {
    alert("Bitte Kategorie und Betrag ausfüllen.");
    return;
  }

  const { error } = await supabase
      .from("Transaktion")
      .insert([
        {
          benutzer_id: benutzerId.value,
          budget_id: budget.budgetId,
          betrag: Number(newAmount.value),
          kategorie: newCategory.value,
          typ: "ausgabe",
          datum: new Date().toISOString().split("T")[0]
        }
      ]);

  if (error) {
    alert(error.message);
    return;
  }

  newCategory.value = "";
  newAmount.value = 0;
  newDescription.value = "";

  Popup();
  await ladeDaten();
}
</script>

<template>
  <div class="dashboard-container">
    <h1>Finanzübersicht</h1>

    <p class="subtitle">
      Hier siehst du, wie viel Prozent deiner Gesamtausgaben auf jede Kategorie entfallen und wie viel vom Budget noch übrig ist.
    </p>

    <p v-if="loading">Laden...</p>
    <p v-if="fehler" class="fehler-text">{{ fehler }}</p>

    <template v-if="!loading && !fehler">
      <section class="chart-grid">
        <article class="chart-card">
          <h2>Ausgaben nach Kategorie</h2>
          <div class="pie-chart" :style="pieStyle"></div>
          <div class="chart-legend">
            <div v-if="categorySlices.length === 0" class="legend-row">
              <span class="legend-label">Noch keine Ausgaben erfasst</span>
            </div>
            <div v-for="item in categorySlices" :key="item.label" class="legend-row">
              <span class="legend-color" :style="{ background: item.color }"></span>
              <span class="legend-label">{{ item.label }}</span>
              <span class="legend-value">{{ item.percent }}%</span>
            </div>
          </div>
        </article>

        <article class="chart-card budget-card">
          <h2>Verbleibendes Budget</h2>
          <div class="donut-chart" :style="budgetStyle">
            <div class="donut-center">
              <strong>{{ remainingAmount >= 0 ? formatCHF(remainingAmount) : '-' + formatCHF(Math.abs(remainingAmount)) }}</strong>
              <span>{{ remainingAmount >= 0 ? 'noch übrig' : 'überzogen' }}</span>
            </div>
          </div>
          <div class="budget-summary">
            <p>Gesamteinnahmen: <strong>{{ formatCHF(budget.income) }}</strong></p>
            <p>Gesamtausgaben: <strong>{{ formatCHF(totalExpenses) }}</strong></p>
            <p>Restbudget: <strong>{{ Math.round(remainingPercent) }}%</strong></p>
          </div>
        </article>
      </section>

      <button class="start-btn" @click="Popup">Transaktion hinzufügen</button>
    </template>
  </div>

  <div class="modal-overlay" id="myPopup">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Neue Transaktion</h2>
        <button class="close-btn" @click="Popup">&times;</button>
      </div>

      <form @submit.prevent="transaktionHinzufuegen" class="transaction-form">
        <div class="form-group">
          <label for="kategorie">Kategorie</label>
          <select id="kategorie" v-model="newCategory">
            <option value="" disabled>Kategorie wählen</option>
            <option v-for="kat in kategorienOptionen" :key="kat" :value="kat">{{ kat }}</option>
          </select>
        </div>

        <div class="form-group">
          <label for="betrag">Betrag (CHF)</label>
          <input type="number" id="betrag" v-model="newAmount" placeholder="0.00" step="0.01" min="0" />
        </div>

        <div class="form-group">
          <label for="beschreibung">Beschreibung</label>
          <textarea id="beschreibung" v-model="newDescription" placeholder="Optional: Weitere Details..." rows="3"></textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="Popup">Abbrechen</button>
          <button type="submit" class="btn-submit">Hinzufügen</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  padding: 40px 20px;
  background: #f3f4f6;
  font-family: Arial, sans-serif;
}

h1 {
  text-align: center;
  color: #111827;
  margin-bottom: 10px;
}

.subtitle {
  text-align: center;
  color: #6b7280;
  margin-bottom: 40px;
}

.fehler-text {
  text-align: center;
  color: #dc2626;
  margin-bottom: 20px;
}

.chart-grid {
  display: grid;
  gap: 24px;
  max-width: 1100px;
  margin: 0 auto 30px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.chart-card {
  background: white;
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}

.chart-card h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #111827;
  margin-bottom: 24px;
}

.pie-chart,
.donut-chart {
  width: 260px;
  height: 260px;
  border-radius: 50%;
  margin: 0 auto 24px auto;
  box-shadow: inset 0 0 0 10px rgba(255, 255, 255, 0.9);
  background-image: conic-gradient(#3b82f6 0 100%);
}

.donut-chart {
  position: relative;
}

.donut-center {
  position: absolute;
  inset: 50%;
  transform: translate(-50%, -50%);
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  box-shadow: 0 0 0 12px rgba(255, 255, 255, 0.95);
}

.donut-center strong {
  display: block;
  font-size: 1.15rem;
  margin-bottom: 4px;
  color: #111827;
}

.donut-center span {
  color: #6b7280;
  font-size: 0.95rem;
}

.chart-legend {
  display: grid;
  gap: 12px;
}

.legend-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.legend-color {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-label {
  color: #374151;
  flex: 1;
  margin-left: 10px;
}

.legend-value {
  font-weight: 700;
  color: #111827;
}

.budget-summary {
  color: #374151;
  line-height: 1.8;
  font-size: 0.95rem;
}

.budget-summary strong {
  color: #111827;
}

.start-btn {
  padding: 14px 30px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.25);
  display: block;
  margin: 0 auto;
}

.start-btn:hover {
  background-color: #2563eb;
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
}

.start-btn:active {
  transform: scale(0.98);
}

.modal-overlay {
  visibility: hidden;
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  transition: background-color 0.3s ease;
}

.modal-overlay.show {
  visibility: visible;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 450px;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: #111827;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #6b7280;
  transition: color 0.2s ease;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #111827;
}

.transaction-form {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-of-type {
  margin-bottom: 28px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-cancel,
.btn-submit {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  font-size: 14px;
}

.btn-cancel {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-cancel:hover {
  background-color: #e5e7eb;
}

.btn-submit {
  background-color: #3b82f6;
  color: white;
}

.btn-submit:hover {
  background-color: #2563eb;
}

.btn-submit:active {
  transform: scale(0.98);
}
</style>