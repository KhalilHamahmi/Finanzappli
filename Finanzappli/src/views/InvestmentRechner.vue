<script setup>
import { ref, computed } from 'vue'

const startkapital = ref(1000)
const monatlicheEinzahlung = ref(100)
const renditeProJahr = ref(5)

const zeitraeume = [
  { label: '2 Monate', monate: 2 },
  { label: '6 Monate', monate: 6 },
  { label: '1 Jahr', monate: 12 },
  { label: '3 Jahre', monate: 36 },
  { label: '5 Jahre', monate: 60 },
]

const gewaehlterZeitraum = ref(zeitraeume[2])

function berechne(monate) {
  const start = Number(startkapital.value) || 0
  const monatlich = Number(monatlicheEinzahlung.value) || 0
  const jahresrate = (Number(renditeProJahr.value) || 0) / 100
  const monatsrate = jahresrate / 12

  let endwert
  if (monatsrate === 0) {
    endwert = start + monatlich * monate
  } else {
    const startWachstum = start * Math.pow(1 + monatsrate, monate)
    const einzahlungWachstum =
      monatlich * ((Math.pow(1 + monatsrate, monate) - 1) / monatsrate)
    endwert = startWachstum + einzahlungWachstum
  }

  const eingezahlt = start + monatlich * monate
  const gewinn = endwert - eingezahlt
  const renditeProzent = eingezahlt > 0 ? (gewinn / eingezahlt) * 100 : 0

  return {
    monate,
    endwert,
    eingezahlt,
    gewinn,
    renditeProzent,
  }
}

const prognosen = computed(() => zeitraeume.map((z) => ({
  label: z.label,
  ...berechne(z.monate),
})))

const detail = computed(() => berechne(gewaehlterZeitraum.value.monate))

const bewertung = computed(() => {
  const r = Number(renditeProJahr.value) || 0
  if (r <= 0) return { text: 'Kein Wachstum – dein Geld verliert real an Wert.', klasse: 'schlecht' }
  if (r < 2) return { text: 'Sehr niedrig – kaum über der Inflation.', klasse: 'schlecht' }
  if (r < 5) return { text: 'Solide und realistisch für sichere Anlagen.', klasse: 'okay' }
  if (r <= 8) return { text: 'Gut – typisch für einen breiten Aktienmarkt.', klasse: 'gut' }
  return { text: 'Sehr hoch – mögliche, aber riskante Rendite.', klasse: 'riskant' }
})

const fmt = (n) =>
  new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
    maximumFractionDigits: 2,
  }).format(n || 0)
</script>

<template>
  <div class="container">
    <h1>Investment&#8209;Rechner</h1>
    <p class="subtitle">
      Berechne, wie sich deine Investition entwickelt – und sieh die Prognose für
      verschiedene Zeiträume.
    </p>

    <div class="card inputs">
      <div class="field">
        <label>Startkapital (CHF)</label>
        <input type="number" v-model.number="startkapital" min="0" step="100" placeholder="z.B. 1000" />
      </div>
      <div class="field">
        <label>Monatliche Einzahlung (CHF)</label>
        <input type="number" v-model.number="monatlicheEinzahlung" min="0" step="50" placeholder="z.B. 100" />
      </div>
      <div class="field">
        <label>Erwartete Rendite pro Jahr (%)</label>
        <input type="number" v-model.number="renditeProJahr" min="0" step="0.5" placeholder="z.B. 5" />
      </div>
    </div>

    <div class="card bewertung" :class="bewertung.klasse">
      {{ bewertung.text }}
    </div>

    <div class="zeitraum-buttons">
      <button
        v-for="z in zeitraeume"
        :key="z.monate"
        :class="{ aktiv: gewaehlterZeitraum.monate === z.monate }"
        @click="gewaehlterZeitraum = z"
      >
        {{ z.label }}
      </button>
    </div>

    <div class="metrics">
      <div class="card metric">
        <p class="metric-label">Endwert nach {{ gewaehlterZeitraum.label }}</p>
        <p class="metric-value">{{ fmt(detail.endwert) }}</p>
      </div>
      <div class="card metric">
        <p class="metric-label">Eingezahlt</p>
        <p class="metric-value">{{ fmt(detail.eingezahlt) }}</p>
      </div>
      <div class="card metric">
        <p class="metric-label">Gewinn</p>
        <p class="metric-value" :class="detail.gewinn >= 0 ? 'pos' : 'neg'">
          {{ detail.gewinn >= 0 ? '+' : '' }}{{ fmt(detail.gewinn) }}
        </p>
      </div>
      <div class="card metric">
        <p class="metric-label">Rendite gesamt</p>
        <p class="metric-value" :class="detail.renditeProzent >= 0 ? 'pos' : 'neg'">
          {{ detail.renditeProzent >= 0 ? '+' : '' }}{{ detail.renditeProzent.toFixed(1) }}%
        </p>
      </div>
    </div>

    <div class="card">
      <h2>Prognose im Vergleich</h2>
      <table>
        <thead>
          <tr>
            <th>Zeitraum</th>
            <th>Eingezahlt</th>
            <th>Endwert</th>
            <th>Gewinn</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="p in prognosen"
            :key="p.label"
            :class="{ markiert: p.monate === gewaehlterZeitraum.monate }"
          >
            <td>{{ p.label }}</td>
            <td>{{ fmt(p.eingezahlt) }}</td>
            <td>{{ fmt(p.endwert) }}</td>
            <td :class="p.gewinn >= 0 ? 'pos' : 'neg'">
              {{ p.gewinn >= 0 ? '+' : '' }}{{ fmt(p.gewinn) }}
            </td>
          </tr>
        </tbody>
      </table>
      <p class="hinweis">
        Die Berechnung verwendet Zinseszins (monatliche Verzinsung). Es handelt sich
        um eine Prognose – tatsächliche Renditen können abweichen.
      </p>
    </div>
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
  max-width: 640px;
}

.card {
  background: white;
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.card h2 {
  color: #111827;
  margin: 0 0 18px;
  font-size: 1.25rem;
}

.inputs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

.field input {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

.field input:focus {
  border-color: #2563eb;
}

.bewertung {
  font-weight: 600;
  color: #111827;
  padding: 18px 25px;
  border-left: 4px solid #9ca3af;
}

.bewertung.schlecht { background: #fef2f2; border-left-color: #dc2626; }
.bewertung.okay { background: #fefce8; border-left-color: #ca8a04; }
.bewertung.gut { background: #f0fdf4; border-left-color: #16a34a; }
.bewertung.riskant { background: #fff7ed; border-left-color: #ea580c; }

.zeitraum-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.zeitraum-buttons button {
  padding: 10px 20px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 999px;
  font-size: 0.95rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.zeitraum-buttons button:hover {
  border-color: #2563eb;
  color: #2563eb;
}

.zeitraum-buttons button.aktiv {
  background: #2563eb;
  border-color: #2563eb;
  color: white;
  font-weight: 600;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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
  font-size: 1.5rem;
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

tr.markiert {
  background: #eff6ff;
}

.pos { color: #16a34a; font-weight: 600; }
.neg { color: #dc2626; font-weight: 600; }

.hinweis {
  margin-top: 16px;
  font-size: 0.85rem;
  color: #6b7280;
}
</style>
