<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "../supabase";

const loading = ref(true);
const fehler = ref(null);
const tipps = ref([]);

const aktuellerMonat = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

onMounted(async () => {
  loading.value = true;
  fehler.value = null;

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    fehler.value = "Nicht eingeloggt.";
    loading.value = false;
    return;
  }

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

  if (!budgetData) {
    loading.value = false;
    return;
  }

  const { data: transData, error: transError } = await supabase
      .from("Transaktion")
      .select("kategorie, betrag, typ")
      .eq("benutzer_id", benutzer.id)
      .eq("typ", "ausgabe")
      .gte("datum", `${monat}-01`);

  if (transError) {
    fehler.value = transError.message;
    loading.value = false;
    return;
  }

  const summenProKategorie = {};
  for (const t of transData) {
    summenProKategorie[t.kategorie] = (summenProKategorie[t.kategorie] || 0) + Number(t.betrag);
  }

  const { data: alleTipps, error: tippError } = await supabase
      .from("Tipp")
      .select("id, titel, inhalt, schwellenwert, kategorie");

  if (tippError) {
    fehler.value = tippError.message;
    loading.value = false;
    return;
  }

  const passendeTipps = [];

  for (const tipp of alleTipps) {
    if (tipp.kategorie === "Sparquote") continue;

    const ausgabe = summenProKategorie[tipp.kategorie] || 0;
    if (ausgabe > tipp.schwellenwert) {
      passendeTipps.push({ ...tipp, wert: ausgabe, art: "kategorie" });
    }
  }

  const einkommen = Number(budgetData.einkommen) || 0;
  const ausgaben = Number(budgetData.ausgaben) || 0;
  if (einkommen > 0) {
    const sparquote = ((einkommen - ausgaben) / einkommen) * 100;

    for (const tipp of alleTipps) {
      if (tipp.kategorie !== "Sparquote") continue;

      if (tipp.titel.includes("Niedrige") && sparquote < tipp.schwellenwert) {
        passendeTipps.push({ ...tipp, wert: sparquote, art: "sparquote" });
      }
      if (tipp.titel.includes("Solide") && sparquote >= tipp.schwellenwert) {
        passendeTipps.push({ ...tipp, wert: sparquote, art: "sparquote" });
      }
    }
  }

  tipps.value = passendeTipps;

  if (budgetData.id && passendeTipps.length > 0) {
    const eintraege = passendeTipps.map((t) => ({
      budget_id: budgetData.id,
      tipp_id: t.id,
    }));

    await supabase.from("Budget_Tipp").upsert(eintraege, { onConflict: "budget_id,tipp_id" });
  }

  loading.value = false;
});

const formatCHF = (value) =>
    new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
      maximumFractionDigits: 2,
    }).format(value);
</script>

<template>
  <div class="tipps-container">
    <h1>Deine Tipps</h1>
    <p class="subtitle">
      Persönliche Spartipps basierend auf deinen Ausgaben in diesem Monat.
    </p>

    <p v-if="loading">Laden...</p>
    <p v-if="fehler" class="fehler-text">{{ fehler }}</p>

    <template v-if="!loading && !fehler">
      <div v-if="tipps.length === 0" class="card empty-card">
        <p>Aktuell gibt es keine besonderen Tipps für dich. Weiter so!</p>
      </div>

      <div v-for="tipp in tipps" :key="tipp.id" class="card tipp-card">
        <h2>{{ tipp.titel }}</h2>
        <p class="tipp-inhalt">{{ tipp.inhalt }}</p>
        <p class="tipp-wert" v-if="tipp.art === 'kategorie'">
          {{ tipp.kategorie }}: <strong>{{ formatCHF(tipp.wert) }}</strong>
          (Schwelle: {{ formatCHF(tipp.schwellenwert) }})
        </p>
        <p class="tipp-wert" v-else>
          Sparquote: <strong>{{ Math.round(tipp.wert) }}%</strong>
          (Schwelle: {{ tipp.schwellenwert }}%)
        </p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.tipps-container {
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

.card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  max-width: 700px;
  margin: 0 auto 20px;
}

.empty-card {
  text-align: center;
  color: #6b7280;
}

.tipp-card h2 {
  margin: 0 0 10px 0;
  font-size: 1.15rem;
  color: #111827;
}

.tipp-inhalt {
  color: #374151;
  line-height: 1.6;
  margin-bottom: 12px;
}

.tipp-wert {
  font-size: 0.9rem;
  color: #6b7280;
}

.tipp-wert strong {
  color: #111827;
}
</style>