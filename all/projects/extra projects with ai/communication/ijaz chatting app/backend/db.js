const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'chat.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    // Create Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        google_id TEXT UNIQUE,
        name TEXT,
        email TEXT UNIQUE,
        avatar TEXT,
        phone_number TEXT UNIQUE,
        password TEXT,
        about TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('Error creating users table', err.message);
        } else {
            // Attempt to add new columns to existing table (will fail silently if they exist)
            db.run(`ALTER TABLE users ADD COLUMN phone_number TEXT`, () => {});
            db.run(`ALTER TABLE users ADD COLUMN password TEXT`, () => {});
            db.run(`ALTER TABLE users ADD COLUMN about TEXT`, () => {});
        }
    });

    // Create Messages table
    db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER,
        receiver_id INTEGER,
        text TEXT,
        is_edited INTEGER DEFAULT 0,
        is_deleted INTEGER DEFAULT 0,
        attachment_url TEXT,
        attachment_type TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id),
        FOREIGN KEY (receiver_id) REFERENCES users(id)
    )`, (err) => {
        if (err) {
            console.error('Error creating messages table', err.message);
        } else {
            // Attempt to add new columns to existing table (will fail silently if they exist)
            db.run(`ALTER TABLE messages ADD COLUMN is_edited INTEGER DEFAULT 0`, () => {});
            db.run(`ALTER TABLE messages ADD COLUMN is_deleted INTEGER DEFAULT 0`, () => {});
            db.run(`ALTER TABLE messages ADD COLUMN attachment_url TEXT`, () => {});
            db.run(`ALTER TABLE messages ADD COLUMN attachment_type TEXT`, () => {});
        }
    });

    // Create OTPs table
    db.run(`CREATE TABLE IF NOT EXISTS otps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone_number TEXT NOT NULL,
        code TEXT NOT NULL,
        expires_at DATETIME NOT NULL
    )`, (err) => {
        if (err) {
            console.error('Error creating otps table', err.message);
        }
    });
  }
});

module.exports = db;
