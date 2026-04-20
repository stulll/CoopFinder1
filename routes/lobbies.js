const express = require('express');
const { authenticateToken, db } = require('../server');

const router = express.Router();

router.get('/', (req, res) => {
  db.all(`
    SELECT l.*, u.username as leader_username
    FROM lobbies l
    JOIN users u ON l.leader_id = u.id
    WHERE l.status = 'active'
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Ошибка сервера' });
    res.json(rows);
  });
});

router.get('/my', authenticateToken, (req, res) => {
  db.all('SELECT * FROM lobbies WHERE leader_id = ?', [req.user.userId], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Ошибка сервера' });
    res.json(rows);
  });
});

router.post('/', authenticateToken, (req, res) => {
  const { game, role_needed, goal, description, platform, max_players = 1 } = req.body;
  db.run(`
    INSERT INTO lobbies (leader_id, game, role_needed, goal, description, platform, max_players, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
  `, [req.user.userId, game, role_needed, goal, description, platform, max_players], function(err) {
    if (err) return res.status(500).json({ message: 'Ошибка сервера' });
    res.status(201).json({ id: this.lastID, leader_id: req.user.userId, game, role_needed, goal, description, platform, max_players, status: 'active' });
  });
});

router.delete('/:id', authenticateToken, (req, res) => {
  const lobbyId = parseInt(req.params.id, 10);
  db.get('SELECT id FROM lobbies WHERE id = ? AND leader_id = ?', [lobbyId, req.user.userId], (err, row) => {
    if (err) return res.status(500).json({ message: 'Ошибка сервера' });
    if (!row) return res.status(404).json({ message: 'Лобби не найдено' });
    db.run('DELETE FROM lobbies WHERE id = ?', [lobbyId], function(err) {
      if (err) return res.status(500).json({ message: 'Ошибка сервера' });
      res.json({ message: 'Лобби удалено' });
    });
  });
});

module.exports = router;

