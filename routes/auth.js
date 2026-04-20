const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../server').db;

const router = express.Router();

router.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  bcrypt.hash(password, 10, (err, hashed) => {
    if (err) return res.status(500).json({ message: 'Ошибка сервера' });
    db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashed], function(err) {
      if (err) return res.status(400).json({ message: 'Пользователь уже существует' });
      const token = jwt.sign({ userId: this.lastID }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
      res.status(201).json({ token, user: { id: this.lastID, username, email } });
    });
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT id, username, email, password FROM users WHERE email = ?', [email], (err, user) => {
    if (err) return res.status(500).json({ message: 'Ошибка сервера' });
    if (!user) return res.status(400).json({ message: 'Неверный email или пароль' });
    bcrypt.compare(password, user.password, (err, valid) => {
      if (err) return res.status(500).json({ message: 'Ошибка сервера' });
      if (!valid) return res.status(400).json({ message: 'Неверный email или пароль' });
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
      res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
    });
  });
});

module.exports = router;

