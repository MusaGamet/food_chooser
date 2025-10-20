const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('food_chooser.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    balance INTEGER DEFAULT 100
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS dishes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    cost INTEGER NOT NULL,
    image TEXT
  )`);

  // Add default admin user
  db.run(`INSERT OR IGNORE INTO users (username, password, balance) VALUES (?, ?, ?)`, ['admin', 'admin123', 100]);
  // Add Kamila user with a strong password and balance
  db.run(`INSERT OR IGNORE INTO users (username, password, balance) VALUES (?, ?, ?)`, ['Kamila', 'K@m1lA_2025!pass', 100]);

  // Add some dishes
  db.run(`INSERT OR IGNORE INTO dishes (name, cost, image) VALUES (?, ?, ?)`, ['Блинчики', 50, 'images/dish1.jpg']);
  db.run(`INSERT OR IGNORE INTO dishes (name, cost, image) VALUES (?, ?, ?)`, ['Яичница', 80, 'images/dish2.jpg']);
  db.run(`INSERT OR IGNORE INTO dishes (name, cost, image) VALUES (?, ?, ?)`, ['Торт', 30, 'images/dish3.jpg']);
});

db.close();
console.log('DB initialized');
