<script>

import {supabase} from "../supabase.js";

</script>


<template>
  <div class="dashboard-container">

    <h1>Finanzübersicht</h1>

    <p class="subtitle">
      So Ville prozent hast du schon in diesem Monat für disses Kategorie ausgegeben.
    </p>
    //Todo: du solte die daten von der datenbank holen und in die diagramm einfügen, damit es dynamisch ist.
    und die kategorien sollten auch von der datenbank kommen und nicht statisch sein.

    <div class="simple-bar-chart">

      <div class="item" style="--clr: #22c55e; --val: 70">
        <div class="label">Essen</div>
        <div class="value">70%</div>
      </div>

      <div class="item" style="--clr: #3b82f6; --val: 45">
        <div class="label">Transport</div>
        <div class="value">45%</div>
      </div>

      <div class="item" style="--clr: #f59e0b; --val: 85">
        <div class="label">Miete</div>
        <div class="value">85%</div>
      </div>

      <div class="item" style="--clr: #ef4444; --val: 30">
        <div class="label">Shopping</div>
        <div class="value">30%</div>
      </div>

      <div class="item" style="--clr: #8b5cf6; --val: 20">
        <div class="label">Freizeit</div>
        <div class="value">20%</div>
      </div>

      <div class="item" style="--clr: #06b6d4; --val: 60">
        <div class="label">Sparen</div>
        <div class="value">60%</div>
      </div>

    </div>
    
    //Todo: du solte die daten von der datenbank holen und in die diagramm einfügen, damit es dynamisch ist.

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
  margin-bottom: 50px;
}

.simple-bar-chart {
  --line-count: 10;
  --line-color: #9ca3af;
  --line-opacity: 0.25;
  --item-gap: 2%;
  --item-default-color: #111827;

  max-width: 900px;
  margin: auto;

  height: 20rem;
  display: grid;
  grid-auto-flow: column;
  gap: var(--item-gap);
  align-items: end;
  padding-inline: var(--item-gap);

  --padding-block: 2rem;
  padding-block: var(--padding-block);

  position: relative;
  isolation: isolate;

  background: white;
  border-radius: 20px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
}

.simple-bar-chart::after {
  content: "";
  position: absolute;
  inset: var(--padding-block) 0;
  z-index: -1;

  --line-width: 1px;
  --line-spacing: calc(100% / var(--line-count));

  background-image: repeating-linear-gradient(
    to top,
    transparent 0 calc(var(--line-spacing) - var(--line-width)),
    var(--line-color) 0 var(--line-spacing)
  );

  box-shadow: 0 var(--line-width) 0 var(--line-color);
  opacity: var(--line-opacity);
}

.simple-bar-chart > .item {
  height: calc(1% * var(--val));
  background-color: var(--clr, var(--item-default-color));
  position: relative;
  border-radius: 12px 12px 0 0;
  animation: item-height 1s ease forwards;
}

@keyframes item-height {
  from {
    height: 0;
  }
}

.simple-bar-chart > .item > * {
  position: absolute;
  text-align: center;
  width: 100%;
}

.simple-bar-chart > .item > .label {
  inset: 100% 0 auto 0;
  margin-top: 10px;
  font-weight: 600;
  color: #374151;
}

.simple-bar-chart > .item > .value {
  inset: auto 0 100% 0;
  margin-bottom: 8px;
  font-weight: bold;
  color: #111827;
}
</style>