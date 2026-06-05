<script>
export default {
  methods: {
    Popup() {
      const modal = document.getElementById("myPopup");
      if (modal) modal.classList.toggle("show");
    }
  }
}
</script>
<template>
  <div class="dashboard-container">

    <h1>Finanzübersicht</h1>

    <p class="subtitle">
      So Ville prozent hast du schon in diesem Monat für disses Kategorie ausgegeben.
   </p>
    Todo: du solte die daten von der datenbank holen und in die diagramm einfügen, damit es dynamisch ist.
    und die kategorien sollten auch von der datenbank kommen und nicht statisch sein.

    <div class="simple-bar-chart">

      <div class="item" style="--clr: #22c55e; --val: 100">
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
  <button class="start-btn" @click="Popup()">
        Transaktionen Hinzufügen
  </button>
  
</div>

  <div class="modal-overlay" id="myPopup">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Neue Transaktion</h2>
        <button class="close-btn" @click="Popup()">&times;</button>
      </div>
      
      <form @submit.prevent class="transaction-form">
        <div class="form-group">
          <label for="kategorie">Kategorie</label>
          <input type="text" id="kategorie" placeholder="z.B. Essen, Transport, Shopping..." />
        </div>

        <div class="form-group">
          <label for="betrag">Betrag (CHF)</label>
          <input type="number" id="betrag" placeholder="0.00" step="0.01" min="0" />
        </div>

        <div class="form-group">
          <label for="beschreibung">Beschreibung</label>
          <textarea id="beschreibung" placeholder="Optional: Weitere Details..." rows="3"></textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="Popup()">Abbrechen</button>
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


.popup {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

/* Modal Styles */
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

.start-btn {
  padding: 12px 28px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  margin-top: 20px;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.start-btn:hover {
  background-color: #2563eb;
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.start-btn:active {
  transform: scale(0.98);
}
</style>