const express = require('express');
const { authenticateToken, db } = require('../server');

const router = express.Router();

router.get('/', (req, res) => {
  db.all(`
    SELECT p.id, u.username, p.role, p.platform, p.goal
    FROM profiles p
    JOIN users u ON p.user_id = u.id
    ORDER BY p.created_at DESC
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Ошибка сервера' });
    res.json(rows);
  });
});

router.get('/me', authenticateToken, (req, res) => {
  db.get('SELECT id, username, email FROM users WHERE id = ?', [req.user.userId], (err, user) => {
    if (err) return res.status(500).json({ message: 'Ошибка сервера' });
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
    db.all('SELECT id, role, platform, goal FROM profiles WHERE user_id = ?', [req.user.userId], (err, profiles) => {
      if (err) return res.status(500).json({ message: 'Ошибка сервера' });
      res.json({ user, profiles });
    });
  });
});

router.post('/', authenticateToken, (req, res) => {
  const { username, role, platform, goal } = req.body;
  const trimmedUsername = typeof username === 'string' ? username.trim() : '';
  if (!trimmedUsername) {
    return res.status(400).json({ message: 'Никнейм обязателен' });
  }

  const isProfileCreation = [role, platform, goal].some((value) => typeof value === 'string' && value.trim() !== '');

  db.run('UPDATE users SET username = ? WHERE id = ?', [trimmedUsername, req.user.userId], (err) => {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT') {
        return res.status(400).json({ message: 'Такой никнейм уже занят' });
      }
      return res.status(500).json({ message: 'Ошибка сервера' });
    }

    if (!isProfileCreation) {
      return res.status(200).json({ username: trimmedUsername, message: 'Никнейм обновлен' });
    }

    db.run('INSERT INTO profiles (user_id, role, platform, goal) VALUES (?, ?, ?, ?)', [req.user.userId, role, platform, goal], function(err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
          return res.status(400).json({ message: 'Ошибка сохранения анкеты: нарушение ограничений данных' });
        }
        return res.status(500).json({ message: 'Ошибка сервера' });
      }
      res.status(201).json({ id: this.lastID, username: trimmedUsername, role, platform, goal });
    });
  });
});

router.delete('/:id', authenticateToken, (req, res) => {
  const profileId = parseInt(req.params.id, 10);
  db.get('SELECT id FROM profiles WHERE id = ? AND user_id = ?', [profileId, req.user.userId], (err, row) => {
    if (err) return res.status(500).json({ message: 'Ошибка сервера' });
    if (!row) return res.status(404).json({ message: 'Анкета не найдена' });
    db.run('DELETE FROM profiles WHERE id = ?', [profileId], function(err) {
      if (err) return res.status(500).json({ message: 'Ошибка сервера' });
      res.json({ message: 'Анкета удалена' });
    });
  });
});

module.exports = router;
