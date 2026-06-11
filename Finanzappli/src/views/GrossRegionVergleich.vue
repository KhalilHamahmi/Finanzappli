<script setup>
import { ref, computed, onMounted } from 'vue'
import {supabase} from "../supabase.js";

const regionen = ref([])
const selectedRegion = ref(null)
const lohn = ref(null)
const loading = ref(false)
const fehler = ref(null)

onMounted(async () => {
  loading.value = true
  const { data, error } = await supabase
      .from('Grossregion')
      .select('id, name, einkommen, p10, p25, p75, p90')
      .order('name')

  if (error) {
    fehler.value = error.message
  } else {
    regionen.value = data
    selectedRegion.value = data[0] ?? null
  }
  loading.value = false
})

function perzentilBerechnen(l, r) {
  const punkte = [
    [0, 0],
    [r.p10, 10],
    [r.p25, 25],
    [r.einkommen, 50],
    [r.p75, 75],
    [r.p90, 90],
    [r.p90 * 2, 99],
  ]
  for (let i = 1; i < punkte.length; i++) {
    const [x0, y0] = punkte[i - 1]
    const [x1, y1] = punkte[i]
    if (l <= x1) {
      return Math.round(y0 + ((l - x0) / (x1 - x0)) * (y1 - y0))
    }
  }
  return 99
}

function fmt(n) {
  return 'CHF ' + Math.round(n).toLocaleString('de-CH')
}

const ergebnis = computed(() => {
  const l = lohn.value
  const r = selectedRegion.value
  if (!l || l <= 0 || !r) return null

  return {
    perzentil: Math.min(99, Math.max(1, perzentilBerechnen(l, r))),
    median: r.einkommen,
    differenz: l - r.einkommen,
    zeilen: [
      { bezeichnung: 'P10 — untere 10%', wert: r.p10 },
      { bezeichnung: 'P25 — untere 25%', wert: r.p25 },
      { bezeichnung: 'Median (P50)',      wert: r.einkommen },
      { bezeichnung: 'P75 — obere 25%',  wert: r.p75 },
      { bezeichnung: 'P90 — obere 10%',  wert: r.p90 },
    ],
  }
})
</script>

<template>
  <div class="container">

    <h1>Grossregionen Vergleich</h1>
    <p class="subtitle">Vergleiche deinen Lohn mit dem Durchschnitt deiner Region.</p>

    <div class="card inputs">
      <div class="field">
        <label>Grossregion</label>
        <select v-model="selectedRegion">
          <option v-for="r in regionen" :key="r.id" :value="r">
            {{ r.name }}
          </option>
        </select>
      </div>
      <div class="field">
        <label>Monatslohn brutto (CHF)</label>
        <input type="number" v-model.number="lohn" min="0" step="100" placeholder="z.B. 6500" />
      </div>
    </div>

    <p v-if="loading">Laden...</p>
    <p v-if="fehler" class="fehler">{{ fehler }}</p>

    <template v-if="ergebnis">

      <div class="metrics">
        <div class="card metric">
          <p class="metric-label">Ihr Perzentil</p>
          <p class="metric-value">{{ ergebnis.perzentil }}.</p>
        </div>
        <div class="card metric">
          <p class="metric-label">Medianlohn {{ selectedRegion.name.split(' (')[0] }}</p>
          <p class="metric-value">{{ fmt(ergebnis.median) }}</p>
        </div>
        <div class="card metric">
          <p class="metric-label">Differenz zum Median</p>
          <p class="metric-value" :class="ergebnis.differenz >= 0 ? 'pos' : 'neg'">
            {{ ergebnis.differenz >= 0 ? '+' : '' }}{{ fmt(ergebnis.differenz) }}
          </p>
        </div>
      </div>

      <div class="card">
        <table>
          <thead>
          <tr>
            <th>Vergleich</th>
            <th>CHF / Monat</th>
            <th>Ihr Lohn</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="zeile in ergebnis.zeilen" :key="zeile.bezeichnung">
            <td>{{ zeile.bezeichnung }}</td>
            <td>{{ fmt(zeile.wert) }}</td>
            <td :class="lohn >= zeile.wert ? 'pos' : 'neg'">
              {{ lohn >= zeile.wert ? 'darüber' : 'darunter' }}
            </td>
          </tr>
          </tbody>
        </table>
      </div>

    </template>

  </div>
</template>

<style scoped>
.container {
  min-height: 100vh;
  background: #f3f4f6;
  padding: 40px 20px;
  font-family: Arial, sans-serif;
}

h1 {
  font-size: 2.5rem;
  color: #111827;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 1.1rem;
  color: #4b5563;
  margin-bottom: 30px;
}

.card {
  background: white;
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.08);
  margin-bottom: 20px;
}

.inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field label {
  font-size: 0.9rem;
  color: #4b5563;
  font-weight: 500;
}

.field select,
.field input {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.metric {
  text-align: center;
}

.metric-label {
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 8px;
}

.metric-value {
  font-size: 1.6rem;
  font-weight: 600;
  color: #111827;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  text-align: left;
  padding: 10px;
  color: #6b7280;
  font-size: 0.9rem;
  border-bottom: 1px solid #e5e7eb;
}

td {
  padding: 10px;
  border-bottom: 1px solid #f3f4f6;
  color: #111827;
}

.pos { color: #16a34a; font-weight: 500; }
.neg { color: #dc2626; font-weight: 500; }
.fehler { color: #dc2626; }
</style>