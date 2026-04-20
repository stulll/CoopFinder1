document.addEventListener('DOMContentLoaded', async () => {
  const lobbyList = document.getElementById('lobbyList');
  const token = localStorage.getItem('token');
  try {
    const response = await fetch('/api/lobbies');
    if (!response.ok) throw new Error('Не удалось загрузить лобби');
    const lobbies = await response.json();
    lobbyList.innerHTML = lobbies.length
      ? lobbies.map(lobby => `
          <article class="lobby-card">
            <div class="lobby-card__head">
              <span class="badge">${lobby.platform || 'Платформа не указана'}</span>
              <span class="badge badge--secondary">${lobby.status || 'active'}</span>
            </div>
            <h3>${lobby.game}</h3>
            <p>${lobby.description || 'Описание пока отсутствует.'}</p>
            <div class="lobby-meta">
              <div>Ищем: <strong>${lobby.role_needed || 'Любая роль'}</strong></div>
              <div>Цель: <strong>${lobby.goal || 'Не указана'}</strong></div>
            </div>
            <div class="lobby-footer">
              Лидер: ${lobby.leader_username || 'Аноним'}
              ${token ? `<button class="button button--small" onclick="applyToLobby(${lobby.id})">Откликнуться</button>` : ''}
            </div>
          </article>
        `).join('')
      : '<div class="empty-state">Пока нет опубликованных лобби.</div>';
  } catch (error) {
    lobbyList.innerHTML = `<div class="empty-state">Ошибка загрузки лобби: ${error.message}</div>`;
  }
});

async function applyToLobby(lobbyId) {
  const message = prompt('Введите сообщение для лидера (опционально):');
  try {
    const response = await fetch(`/api/lobbies/${lobbyId}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ message })
    });
    if (!response.ok) {
      const result = await response.json();
      alert(result.message);
    } else {
      alert('Отклик отправлен!');
      location.reload();
    }
  } catch (error) {
    alert('Ошибка: ' + error.message);
  }
}
