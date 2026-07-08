const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
const dbPath = path.join(dbDir, 'teleios.db');

let db, isWasm = false;
let ready = false;
let readyResolve;
const readyPromise = new Promise(r => readyResolve = r);

const schemas = [
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS team (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    initials TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    bio TEXT,
    quote TEXT,
    borderColor TEXT DEFAULT '#D4AF37',
    gradient TEXT,
    image TEXT,
    email TEXT,
    userId INTEGER,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    number TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    src TEXT NOT NULL,
    alt TEXT,
    width INTEGER,
    height INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
];

// Try better-sqlite3 first (fast, native)
try {
  const Database = require('better-sqlite3');
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  for (const sql of schemas) db.exec(sql);
  console.log('SQLite driver: better-sqlite3 (native)');
  ready = true;
  readyResolve();
} catch (e1) {
  console.log('better-sqlite3 unavailable (' + e1.message + '), trying sql.js...');
  try {
    const initSqlJs = require('sql.js');
    initSqlJs().then(SQL => {
      try {
        const existing = fs.existsSync(dbPath) ? fs.readFileSync(dbPath) : null;
        db = new SQL.Database(existing);
        isWasm = true;
        for (const sql of schemas) db.run(sql);
        if (existing) saveWasm();
        console.log('SQLite driver: sql.js (WASM)');
      } catch (e) {
        console.error('sql.js init error:', e.message);
      }
      ready = true;
      readyResolve();
    }).catch(e2 => {
      console.error('sql.js init failed:', e2.message);
      ready = true;
      readyResolve();
    });
  } catch (e2) {
    console.error('sql.js unavailable (' + e2.message + '). No database driver.');
    ready = true;
    readyResolve();
  }
}

function saveWasm() {
  if (!isWasm) return;
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

async function query(sql, params = []) {
  if (!ready) await readyPromise;
  if (!db) throw new Error('No database driver available');
  const trimmed = sql.trim().toUpperCase();
  if (isWasm) {
    if (trimmed.startsWith('SELECT') || trimmed.startsWith('WITH')) {
      const stmt = db.prepare(sql);
      if (params.length > 0) stmt.bind(params);
      const rows = [];
      while (stmt.step()) rows.push(stmt.getAsObject());
      stmt.free();
      return [rows];
    } else {
      db.run(sql, params);
      const changes = db.getRowsModified();
      saveWasm();
      return [{ affectedRows: changes, insertId: null }];
    }
  } else {
    if (trimmed.startsWith('SELECT') || trimmed.startsWith('WITH')) {
      const stmt = db.prepare(sql);
      const rows = stmt.all(...params);
      return [rows];
    } else {
      const stmt = db.prepare(sql);
      const info = stmt.run(...params);
      return [{ affectedRows: info.changes, insertId: info.lastInsertRowid }];
    }
  }
}

module.exports = { query, db, readyPromise };
