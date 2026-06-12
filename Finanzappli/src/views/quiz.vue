<template>
  <div class="quiz-page">
    <h1>Finanz-Quiz</h1>
    <p class="intro">
      Sag zuerst, welche Ausgabenkategorien du hast.
    </p>

    <p v-if="loading">Laden...</p>
    <p v-if="fehler" class="note warning-note">{{ fehler }}</p>

    <form v-if="!loading" @submit.prevent="handleSubmit" class="quiz-form">
      <fieldset class="form-group checkbox-fieldset">
        <legend>1. Welche Ausgabenkategorien hast du?</legend>

        <div class="checkbox-group" v-for="option in categoryOptions" :key="option.key">
          <label>
            <input type="checkbox" :value="option.key" v-model="selectedCategories" />
            {{ option.label }}
          </label>
        </div>
      </fieldset>

      <div v-if="selectedCategories.length === 0" class="note">
        Wähle mindestens eine Kategorie aus, um weiterzumachen.
      </div>

      <div class="form-group">
        <label for="income">2. Wie hoch ist dein Einkommen pro Monat? (CHF)</label>
        <input id="income" type="number" v-model.number="income" min="0" placeholder="z.B. 3200" />
      </div>

      <div class="form-group">
        <label for="savingGoal">3. Wie viel möchtest du im Monat sparen? (CHF)</label>
        <input id="savingGoal" type="number" v-model.number="savingGoal" min="0" placeholder="z.B. 500" />
      </div>

      <div v-for="category in selectedCategoryOptions" :key="category.key" class="form-group">
        <label :for="category.key">Ausgaben {{ category.label }} (CHF)</label>
        <input :id="category.key" type="number" v-model.number="categoryAmounts[category.key]" min="0" placeholder="z.B. 1200" />
      </div>

      <button type="submit" :disabled="selectedCategories.length === 0">Antworten speichern</button>
    </form>

    <section v-if="submitted" class="summary">
      <h2>Deine Antworten</h2>
      <p>Einkommen: <strong>{{ formatCHF(income) }}</strong></p>
      <p>Monatliches Sparziel: <strong>{{ formatCHF(savingGoal) }}</strong></p>
      <div v-for="category in selectedCategoryOptions" :key="category.key">
        <p>{{ category.label }}: <strong>{{ formatCHF(categoryAmounts[category.key]) }}</strong></p>
      </div>
      <p>Gesamtausgaben: <strong>{{ formatCHF(totalExpenses) }}</strong></p>

      <div class="advice" :class="{ warning: totalExpenses > income }">
        {{ adviceText }}
      </div>
    </section>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { supabase } from '../supabase'

export default {
  setup() {
    const income = ref(0)
    const savingGoal = ref(0)
    const selectedCategories = ref([])
    const loading = ref(true)
    const fehler = ref(null)

    const benutzerId = ref(null)
    const budgetId = ref(null)

    const categoryOptions = [
      { key: 'rent', label: 'Wohnen / Miete' },
      { key: 'food', label: 'Lebensmittel' },
      { key: 'transport', label: 'Transport' },
      { key: 'entertainment', label: 'Freizeit' },
      { key: 'health', label: 'Gesundheit' },
      { key: 'others', label: 'Weitere Ausgaben' },
    ]

    const categoryAmounts = reactive({
      rent: 0,
      food: 0,
      transport: 0,
      entertainment: 0,
      health: 0,
      others: 0,
    })

    const submitted = ref(false)

    const aktuellerMonat = () => {
      const now = new Date()
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    }

    onMounted(async () => {
      loading.value = true

      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (authError || !authData.user) {
        fehler.value = 'Nicht eingeloggt.'
        loading.value = false
        return
      }

      const { data: benutzer, error: benutzerError } = await supabase
          .from('Benutzer')
          .select('id')
          .eq('auth_id', authData.user.id)
          .single()

      if (benutzerError || !benutzer) {
        fehler.value = 'Benutzer nicht gefunden.'
        loading.value = false
        return
      }

      benutzerId.value = benutzer.id

      const monat = aktuellerMonat()
      const { data: budgetData, error: budgetError } = await supabase
          .from('Budget')
          .select('id, einkommen, sparziel')
          .eq('benutzer_id', benutzer.id)
          .eq('monat', monat)
          .maybeSingle()

      if (budgetError) {
        fehler.value = budgetError.message
        loading.value = false
        return
      }

      if (budgetData) {
        budgetId.value = budgetData.id
        income.value = Number(budgetData.einkommen) || 0
        savingGoal.value = Number(budgetData.sparziel) || 0
      } else {
        const { data: neuesBudget, error: insertError } = await supabase
            .from('Budget')
            .insert([{ monat, benutzer_id: benutzer.id, einkommen: 0, ausgaben: 0, sparziel: 0 }])
            .select('id')
            .single()

        if (insertError) {
          fehler.value = insertError.message
          loading.value = false
          return
        }

        budgetId.value = neuesBudget.id
      }

      loading.value = false
    })

    const selectedCategoryOptions = computed(() =>
        categoryOptions.filter((option) => selectedCategories.value.includes(option.key))
    )

    const totalExpenses = computed(() =>
        selectedCategoryOptions.value.reduce((sum, category) => sum + (categoryAmounts[category.key] || 0), 0)
    )

    const adviceText = computed(() => {
      if (totalExpenses.value > income.value) {
        return 'Achtung: Deine Ausgaben sind höher als dein Einkommen. Versuche, Ausgaben zu reduzieren oder dein Sparziel anzupassen.'
      }

      const remaining = income.value - totalExpenses.value - savingGoal.value
      if (remaining >= 0) {
        return 'Gut gemacht! Dein Budget ist ausgeglichen, und du kannst dein Sparziel erreichen.'
      }
      return 'Dein Sparziel ist aktuell etwas hoch. Überlege, ob du deine Ausgaben senken oder dein Sparziel leicht reduzieren willst.'
    })

    const handleSubmit = async () => {
      // 1. Budget aktualisieren (Einkommen, Sparziel, Ausgaben)
      const { error: updateError } = await supabase
          .from('Budget')
          .update({
            einkommen: income.value,
            sparziel: savingGoal.value,
            ausgaben: totalExpenses.value,
          })
          .eq('id', budgetId.value)

      if (updateError) {
        fehler.value = updateError.message
        return
      }

      // 2. Für jede gewählte Kategorie eine Transaktion anlegen
      const heute = new Date().toISOString().split('T')[0]
      const transaktionen = selectedCategoryOptions.value
          .filter((category) => categoryAmounts[category.key] > 0)
          .map((category) => ({
            benutzer_id: benutzerId.value,
            budget_id: budgetId.value,
            betrag: categoryAmounts[category.key],
            kategorie: category.label,
            typ: 'ausgabe',
            datum: heute,
          }))

      if (transaktionen.length > 0) {
        const { error: insertError } = await supabase
            .from('Transaktion')
            .insert(transaktionen)

        if (insertError) {
          fehler.value = insertError.message
          return
        }
      }

      submitted.value = true
    }

    const formatCHF = (value) => {
      return new Intl.NumberFormat('de-CH', {
        style: 'currency',
        currency: 'CHF',
        maximumFractionDigits: 2,
      }).format(value || 0)
    }

    return {
      income,
      savingGoal,
      selectedCategories,
      categoryOptions,
      categoryAmounts,
      submitted,
      loading,
      fehler,
      selectedCategoryOptions,
      totalExpenses,
      adviceText,
      handleSubmit,
      formatCHF,
    }
  },
}
</script>

<style scoped>
.quiz-page {
  max-width: 720px;
  margin: 2rem auto;
  padding: 1.5rem;
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 15px 40px rgba(15, 23, 42, 0.08);
  font-family: Arial, sans-serif;
}

.quiz-page h1 {
  margin-bottom: 0.6rem;
  color: #1f2937;
}

.intro {
  color: #4b5563;
  margin-bottom: 1.5rem;
}

.quiz-form {
  display: grid;
  gap: 1rem;
}

.form-group {
  display: grid;
  gap: 0.4rem;
}

.checkbox-fieldset {
  border: 1px solid #d1d5db;
  border-radius: 14px;
  padding: 1rem;
}

.checkbox-fieldset legend {
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #111827;
}

.form-group label {
  font-weight: 600;
  color: #111827;
}

.form-group input[type='number'] {
  padding: 0.85rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 1rem;
  color: #111827;
}

.note {
  padding: 0.9rem 1rem;
  border-radius: 12px;
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fcd34d;
}

.warning-note {
  background: #fee2e2;
  color: #991b1b;
  border-color: #fca5a5;
}

button {
  margin-top: 0.5rem;
  padding: 0.95rem 1.3rem;
  border: none;
  border-radius: 12px;
  background: #2563eb;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

button:hover:not(:disabled) {
  background: #1d4ed8;
}

button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.summary {
  margin-top: 2rem;
  padding: 1.4rem;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.summary h2 {
  margin-bottom: 1rem;
  color: #111827;
}

.summary p {
  margin: 0.45rem 0;
  color: #374151;
}

.advice {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 14px;
  background: #d1fae5;
  color: #065f46;
  font-weight: 600;
}

.advice.warning {
  background: #fee2e2;
  color: #991b1b;
}
</style>