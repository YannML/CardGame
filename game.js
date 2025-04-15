// game.js
import { db, ref, set, onValue, update } from './firebase-config.js';
import { playerName, roomId, playerId } from './matchmaking.js';

let players = [];
let currentTurn = 0;

const gameRef = ref(db, `rooms/${roomId}`);

function startGameLogic() {
  onValue(gameRef, (snapshot) => {
    const data = snapshot.val();
    if (data.state === 'playing') {
      players = Object.entries(data.players || {}).map(([id, info]) => ({ id, ...info }));
      renderGameBoard();
      if (!data.turn) {
        update(ref(db, `rooms/${roomId}`), {
          turn: players[0].id,
          deck: shuffle(generateDeck())
        });
      }
    }
  });

  onValue(ref(db, `rooms/${roomId}/turn`), (snap) => {
    const turnId = snap.val();
    if (turnId) {
      const current = players.find(p => p.id === turnId);
      document.getElementById('currentPlayer').textContent = current ? current.name : '---';
    }
  });
}

function renderGameBoard() {
  document.getElementById('lobby').classList.add('hidden');
  document.getElementById('game').classList.remove('hidden');
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function generateDeck() {
  return [
    { type: 'PACTO', text: 'Faça um pacto para dobrar seus desejos.' },
    { type: 'DESEJO', text: 'Ganhe 1 desejo.' },
    { type: 'DESEJO', text: 'Ganhe 2 desejos.' },
    { type: 'PENITÊNCIA', text: 'Perca 1 ponto de corrupção.' },
    { type: 'INTERVENÇÃO', text: 'Revele um objetivo oculto de outro jogador.' },
    { type: 'INTERVENÇÃO', text: 'Agouro estendido – +1 turno com corrupção.' },
    { type: 'INTERVENÇÃO', text: 'Ceifar objetivos – o jogo acaba no próximo turno.' },
    // ... adicione o restante das cartas
  ];
}

export { startGameLogic };
