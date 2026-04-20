const express = require('express');
const { db } = require('../server');

const router = express.Router();

router.get('/', (req, res) => {
  const { game, role, platform, goal } = req.query;
  let query = `
    SELECT l.*, u.username as leader_username
    FROM lobbies l
    JOIN users u ON l.leader_id = u.id
    WHERE l.status = 'active'
  `;
  const params = [];
  if (game) {
    query += ' AND l.game LIKE ?';
    params.push(`%${game}%`);
  }
  if (role) {
    query += ' AND l.role_needed LIKE ?';
    params.push(`%${role}%`);
  }
  if (platform) {
    query += ' AND l.platform LIKE ?';
    params.push(`%${platform}%`);
  }
  if (goal) {
    query += ' AND l.goal LIKE ?';
    params.push(`%${goal}%`);
  }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ message: 'Ошибка сервера' });
    res.json(rows);
  });
});

module.exports = router;
