const API_BASE = 'http://localhost:5000';

document.addEventListener('DOMContentLoaded', () => {
  const forms = document.querySelectorAll('form');
  const token = localStorage.getItem('token');

  const nav = document.querySelector('.nav');
  if (nav) {
    const loginLink = nav.querySelector('a[href="login.html"]');
    if (token && loginLink) {
      loginLink.href = '#';
      loginLink.textContent = 'Выход';
      loginLink.id = 'logoutBtn';
    }
  }

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const apiRequest = async (url, options = {}) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(`${API_BASE}${url}`, { ...options, headers: { ...headers, ...options.headers } });
  };

  forms.forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const type = form.dataset.formType || 'form';

      if ((type === 'profile' || type === 'lobby') && !token) {
        alert('Пожалуйста, войдите, чтобы сохранить анкету или создать лобби.');
        window.location.href = 'login.html';
        return;
      }

      if (type === 'login') {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        try {
          const response = await apiRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(data)
          });
          const result = await response.json();
          if (response.ok) {
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            alert('Вход выполнен успешно!');
            window.location.href = 'profile.html';
          } else {
            alert(result.message);
          }
        } catch (error) {
          alert('Ошибка при входе: ' + error.message);
        }
      } else if (type === 'register') {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        try {
          const response = await apiRequest('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(data)
          });
          const resultText = await response.text();
          const result = resultText ? JSON.parse(resultText) : {};
          if (response.ok) {
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            alert('Регистрация прошла успешно!');
            window.location.href = 'profile.html';
          } else {
            alert(result.message || `Ошибка сервера: ${response.status}`);
          }
        } catch (error) {
          alert('Ошибка при регистрации: ' + error.message);
        }
      } else if (type === 'profile') {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        try {
          const response = await apiRequest('/api/profiles', {
            method: 'POST',
            body: JSON.stringify(data)
          });
          if (response.ok) {
            alert('Профиль сохранён!');
            window.location.href = 'profile.html';
          } else {
            const result = await response.json();
            alert(result.message);
          }
        } catch (error) {
          alert('Ошибка сохранения профиля: ' + error.message);
        }
      } else if (type === 'lobby') {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        try {
          const response = await apiRequest('/api/lobbies', {
            method: 'POST',
            body: JSON.stringify(data)
          });
          if (response.ok) {
            alert('Лобби создано!');
            window.location.href = 'lobbies.html';
          } else {
            const result = await response.json();
            alert(result.message);
          }
        } catch (error) {
          alert('Ошибка создания лобби: ' + error.message);
        }
      } else {
        alert('Это макет формы. Реальная отправка данных на сервер пока не подключена.');
      }
    });
  });

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = 'index.html';
    });
  }

  document.addEventListener('click', async (event) => {
    const profileBtn = event.target.closest('[data-action="delete-profile"]');
    if (profileBtn) {
      const profileId = profileBtn.dataset.id;
      if (confirm('Удалить эту анкету?')) {
        await deleteProfile(profileId);
      }
      return;
    }

    const contactBtn = event.target.closest('[data-action="contact-profile"]');
    if (contactBtn) {
      alert('Функция отправки сообщений временно недоступна.');
      return;
    }

    const applyBtn = event.target.closest('[data-action="apply-lobby"]');
    if (applyBtn) {
      alert('Функция отклика временно недоступна.');
      return;
    }

    const lobbyBtn = event.target.closest('[data-action="delete-lobby"]');
    if (lobbyBtn) {
      const lobbyId = lobbyBtn.dataset.id;
      if (confirm('Удалить это лобби?')) {
        await deleteLobby(lobbyId);
      }
      return;
    }
  });

  if (window.location.pathname.includes('profile.html')) {
    loadProfile();
    loadPlayers();
  }

  if (window.location.pathname.includes('players.html')) {
    loadPlayers();
  }

  if (window.location.pathname.includes('lobbies.html')) {
    loadLobbies();
  }
});

async function deleteProfile(profileId) {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_BASE}/api/profiles/${profileId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      alert('Анкета удалена');
      loadProfile();
    } else {
      const result = await response.json();
      alert(result.message || 'Не удалось удалить анкету');
    }
  } catch (error) {
    alert('Ошибка удаления анкеты: ' + error.message);
  }
}

async function deleteLobby(lobbyId) {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_BASE}/api/lobbies/${lobbyId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      alert('Лобби удалено');
      loadProfile();
    } else {
      const result = await response.json();
      alert(result.message || 'Не удалось удалить лобби');
    }
  } catch (error) {
    alert('Ошибка удаления лобби: ' + error.message);
  }
}



async function loadPlayers() {
  try {
    const response = await fetch(`${API_BASE}/api/profiles`);
    if (!response.ok) throw new Error('Не удалось загрузить анкеты игроков');
    const profiles = await response.json();
    const allProfileCards = document.getElementById('allProfileCards');
    const playersContainer = document.getElementById('playersContainer');
    
    const container = allProfileCards || playersContainer;
    if (!container) return;
    
    container.innerHTML = profiles.length
      ? profiles.map(profile => `
          <article class="card card--small">
            <h3>${profile.username}</h3>
            <p>Роль: ${profile.role || 'Не указана'}</p>
            <p>Платформа: ${profile.platform || 'Не указана'}</p>
            <p>Цель: ${profile.goal || 'Не указана'}</p>
            <button class="button button--outline" data-action="contact-profile" data-id="${profile.id}">Написать</button>
          </article>
        `).join('')
      : '<div class="empty-state">Пока нет анкет игроков.</div>';
  } catch (error) {
    const allProfileCards = document.getElementById('allProfileCards');
    const playersContainer = document.getElementById('playersContainer');
    const container = allProfileCards || playersContainer;
    if (container) {
      container.innerHTML = `<div class="empty-state">Ошибка загрузки анкет: ${error.message}</div>`;
    }
  }
}
async function loadProfile() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Пожалуйста, войдите в систему');
    window.location.href = 'login.html';
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/profiles/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      const data = await response.json();
      const nameInput = document.getElementById('profileName');
      const profileUsername = document.getElementById('profileUsername');
      const username = data.user.username;

      if (nameInput && username) nameInput.value = username;
      if (profileUsername && username) profileUsername.textContent = username;

      const profileCards = document.getElementById('profileCards');
      if (profileCards && data.profiles) {
        profileCards.innerHTML = data.profiles.length
          ? data.profiles.map(profile => `
              <article class="card card--small">
                <h3>${profile.platform}</h3>
                <p>Роль: ${profile.role}</p>
                <p>Цель: ${profile.goal}</p>
                <button class="button button--danger" data-action="delete-profile" data-id="${profile.id}">Удалить</button>
              </article>
            `).join('')
          : '<div class="empty-state">У вас пока нет анкет.</div>';
      }

      const userLobbies = document.getElementById('userLobbies');
      if (userLobbies) {
        const lobbiesResponse = await fetch(`${API_BASE}/api/lobbies/my`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (lobbiesResponse.ok) {
          const lobbies = await lobbiesResponse.json();
          userLobbies.innerHTML = lobbies.length
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
                    Лидер: ${username}
                    <button class="button button--danger" data-action="delete-lobby" data-id="${lobby.id}">Удалить</button>
                  </div>
                </article>
              `).join('')
            : '<div class="empty-state">У вас пока нет лобби.</div>';
        } else {
          userLobbies.innerHTML = '<div class="empty-state">Ошибка загрузки лобби.</div>';
        }
      }
    } else {
      alert('Ошибка загрузки профиля');
      window.location.href = 'login.html';
    }
  } catch (error) {
    console.error('Ошибка загрузки профиля:', error);
  }
}

async function loadLobbies() {
  try {
    const response = await fetch(`${API_BASE}/api/lobbies`);
    if (!response.ok) throw new Error('Не удалось загрузить лобби');
    const lobbies = await response.json();
    const lobbyList = document.getElementById('lobbyList');
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
              <button class="button button--outline" data-action="apply-lobby" data-id="${lobby.id}">Откликнуться</button>
            </div>
          </article>
        `).join('')
      : '<div class="empty-state">Пока нет опубликованных лобби.</div>';
  } catch (error) {
    const lobbyList = document.getElementById('lobbyList');
    lobbyList.innerHTML = `<div class="empty-state">Ошибка загрузки лобби: ${error.message}</div>`;
  }
}
