
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');

const SECRET = 'supersecretkey'; // В продакшене хранить в env
const app = express();
const PORT = process.env.PORT || 3000;
const db = new sqlite3.Database('food_chooser.db');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

function generateToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '2h' });
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });
  const token = auth.replace('Bearer ', '');
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Регистрация
app.post('/api/register', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], function(err) {
    if (err) return res.status(400).json({ error: 'Username already exists' });
    db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err, user) => {
      if (err || !user) return res.status(500).json({ error: 'User creation failed' });
      res.json({ ok: true, user: { username: user.username }, token: generateToken(user) });
    });
  });
});

// Логин
app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'Неправильный логин или пароль' });
    res.json({ ok: true, user: { username: user.username }, token: generateToken(user) });
  });
});

// Смена пароля
app.post('/api/change_password', authMiddleware, (req, res) => {
  const { oldPassword, newPassword } = req.body || {};
  if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Old and new password required' });
  db.get('SELECT * FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err || !user || user.password !== oldPassword) return res.status(401).json({ error: 'Wrong old password' });
    db.run('UPDATE users SET password = ? WHERE id = ?', [newPassword, req.user.id], function(err) {
      if (err) return res.status(500).json({ error: 'Password change failed' });
      res.json({ ok: true });
    });
  });
});

// Получить блюда
app.get('/api/dishes', (req, res) => {
  db.all('SELECT * FROM dishes', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch dishes' });
    res.json({ ok: true, dishes: rows });
  });
});

// Добавить блюдо (только для админа)
app.post('/api/dishes', authMiddleware, (req, res) => {
  const { name, cost, image } = req.body || {};
  if (!name || !cost) return res.status(400).json({ error: 'Name and cost required' });
  // Проверка на админа
  db.get('SELECT * FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err || !user || user.username !== 'admin') return res.status(403).json({ error: 'Only admin can add dishes' });
    db.run('INSERT INTO dishes (name, cost, image) VALUES (?, ?, ?)', [name, cost, image || null], function(err) {
      if (err) return res.status(500).json({ error: 'Failed to add dish' });
      res.json({ ok: true, id: this.lastID });
    });
  });
});

// Удалить блюдо (только для админа)
app.delete('/api/dishes/:id', authMiddleware, (req, res) => {
  db.get('SELECT * FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err || !user || user.username !== 'admin') return res.status(403).json({ error: 'Only admin can delete dishes' });
    db.run('DELETE FROM dishes WHERE id = ?', [req.params.id], function(err) {
      if (err) return res.status(500).json({ error: 'Failed to delete dish' });
      res.json({ ok: true });
    });
  });
});

// Изменить баланс пользователя Kamila (только для админа)
app.post('/api/set_balance_kamila', authMiddleware, (req, res) => {
  const { balance } = req.body || {};
  if (typeof balance !== 'number' || isNaN(balance)) return res.status(400).json({ error: 'Баланс должен быть числом' });
  db.get('SELECT * FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err || !user || user.username !== 'admin') return res.status(403).json({ error: 'Only admin can change balance' });
    db.run('UPDATE users SET balance = ? WHERE username = ?', [balance, 'Kamila'], function(err) {
      if (err) return res.status(500).json({ error: 'Failed to update balance' });
      res.json({ ok: true });
    });
  });
});

// Получить баланс пользователя по username
app.get('/api/user_balance', (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ error: 'Username required' });
  db.get('SELECT balance FROM users WHERE username = ?', [username], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'User not found' });
    res.json({ ok: true, balance: row.balance });
  });
});

app.listen(PORT, () => {
  console.log(`JWT+sqlite server listening on http://localhost:${PORT}`);
});
