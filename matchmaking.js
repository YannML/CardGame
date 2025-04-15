// matchmaking.js
import { db, ref, set, onValue, push, update } from './firebase-config.js';

let playerName = '';
let roomId = '';
let playerId = '';

window.createRoom = () => {
  playerName = document.getElementById('nickname').value.trim();
  if (!playerName) return alert('Digite um nome!');

  const newRoomRef = push(ref(db, 'rooms'));
  roomId = newRoomRef.key;
  playerId = crypto.randomUUID();

  set(newRoomRef, {
    players: {
      [playerId]: { name: playerName, ready: false }
    },
    state: 'lobby'
  });

  enterLobby();
};

window.joinRoom = () => {
  playerName = document.getElementById('nickname').value.trim();
  const inputCode = document.getElementById('roomCode').value.trim();
  if (!playerName || !inputCode) return alert('Digite nome e código!');

  roomId = inputCode;
  playerId = crypto.randomUUID();

  const playerRef = ref(db, `rooms/${roomId}/players/${playerId}`);
  set(playerRef, { name: playerName, ready: false });

  enterLobby();
};

function enterLobby() {
  document.getElementById('home').classList.add('hidden');
  document.getElementById('lobby').classList.remove('hidden');
  document.getElementById('currentRoom').textContent = roomId;

  const playersListRef = ref(db, `rooms/${roomId}/players`);
  onValue(playersListRef, (snapshot) => {
    const list = document.getElementById('playersList');
    list.innerHTML = '';
    snapshot.forEach(child => {
      const div = document.createElement('div');
      div.textContent = child.val().name;
      list.appendChild(div);
    });
  });
}

window.startGame = () => {
  const roomRef = ref(db, `rooms/${roomId}`);
  update(roomRef, { state: 'playing' });
};

export { playerName, roomId, playerId };