// Safe migration: add 'balance' column to users table if it's missing
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('food_chooser.db');

db.serialize(() => {
  db.get("PRAGMA table_info('users')", (err, row) => {
    // We'll just try to add the column; if it exists SQLite will error, so catch it
  });

  db.run("ALTER TABLE users ADD COLUMN balance INTEGER DEFAULT 100", (err) => {
    if (err) {
      if (err.message && err.message.includes('duplicate column name')) {
        console.log('Migration skipped: column already exists');
      } else {
        console.error('Migration error:', err.message || err);
      }
    } else {
      console.log('Migration applied: added balance column with default 100');
    }
    db.close();
  });
});
