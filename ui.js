// ui.js
import { db, ref, onValue, update } from './firebase-config.js';
import { playerId, roomId } from './matchmaking.js';

function renderCard(card) {
  const container = document.getElementById('cardDisplay');
  container.innerHTML = '';

  const cardEl = document.createElement('div');
  cardEl.className = `card ${card.type.toLowerCase()}`;
  cardEl.innerHTML = `
    <h3>${card.type}</h3>
    <p>${card.text}</p>
  `;
  container.appendChild(cardEl);

  const confirmBtn = document.createElement('button');
  confirmBtn.textContent = 'Confirmar Ação';
  confirmBtn.onclick = () => endTurn();
  container.appendChild(confirmBtn);
}

function drawCard() {
  const deckRef = ref(db, `rooms/${roomId}/deck`);
  onValue(deckRef, (snap) => {
    const deck = snap.val();
    if (deck && deck.length > 0) {
      const card = deck[0];
      renderCard(card);
      const newDeck = deck.slice(1);
      update(deckRef, newDeck);
    }
  }, { onlyOnce: true });
}

function endTurn() {
  const playersRef = ref(db, `rooms/${roomId}/players`);
  onValue(playersRef, (snap) => {
    const ids = Object.keys(snap.val());
    const idx = ids.indexOf(playerId);
    const nextId = ids[(idx + 1) % ids.length];
    update(ref(db, `rooms/${roomId}`), { turn: nextId });
  }, { onlyOnce: true });
}

export { drawCard };