const express = require('express');
const { authenticateToken, db } = require('../server');

const router = express.Router();

router.get('/', (req, res) => {
  db.all(`
    SELECT r.*, uf.username as from_username, ut.username as to_username
    FROM reviews r
    JOIN users uf ON r.from_user_id = uf.id
    JOIN users ut ON r.to_user_id = ut.id
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Ошибка сервера' });
    res.json(rows);
  });
});

router.post('/', authenticateToken, (req, res) => {
  const { toUserId, rating, comment } = req.body;
  db.run(`
    INSERT INTO reviews (from_user_id, to_user_id, rating, comment)
    VALUES (?, ?, ?, ?)
  `, [req.user.userId, toUserId, rating, comment], function(err) {
    if (err) return res.status(500).json({ message: 'Ошибка сервера' });
    res.status(201).json({ id: this.lastID, from_user_id: req.user.userId, to_user_id: toUserId, rating, comment });
  });
});

module.exports = router;
