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
  <div>

    <div>
      <label>Grossregion</label>
      <select v-model="selectedRegion">
        <option v-for="r in regionen" :key="r.id" :value="r">
          {{ r.name }}
        </option>
      </select>
    </div>

    <div>
      <label>Monatslohn brutto (CHF)</label>
      <input type="number" v-model.number="lohn" min="0" step="100" />
    </div>

    <p v-if="loading">Laden...</p>
    <p v-if="fehler">{{ fehler }}</p>

    <template v-if="ergebnis">
      <p>Perzentil: {{ ergebnis.perzentil }}</p>
      <p>Medianlohn {{ selectedRegion.name }}: {{ fmt(ergebnis.median) }}</p>
      <p>Differenz zum Median: {{ ergebnis.differenz >= 0 ? '+' : '' }}{{ fmt(ergebnis.differenz) }}</p>

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
          <td>{{ lohn >= zeile.wert ? 'darüber' : 'darunter' }}</td>
        </tr>
        </tbody>
      </table>
    </template>

  </div>
</template>

<style scoped>
</style>