const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function init() {
  try {
    await pool.query(`SELECT 1`);
    console.log('PostgreSQL connected');
  } catch (err) {
    console.error('PostgreSQL connection failed:', err.message, err.code);
    throw err;
  }
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'viewer',
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS team (
      id SERIAL PRIMARY KEY,
      initials TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      bio TEXT,
      quote TEXT,
      "borderColor" TEXT DEFAULT '#D4AF37',
      gradient TEXT,
      image TEXT,
      email TEXT,
      "userId" INTEGER REFERENCES users(id) ON DELETE SET NULL
    )`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS services (
      id SERIAL PRIMARY KEY,
      number TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT
    )`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS gallery (
      id SERIAL PRIMARY KEY,
      src TEXT NOT NULL,
      alt TEXT,
      width INTEGER,
      height INTEGER
    )`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS contacts (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT,
      message TEXT NOT NULL,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS uploads (
      id SERIAL PRIMARY KEY,
      data TEXT NOT NULL,
      mime TEXT NOT NULL DEFAULT 'image/jpeg'
    )`);
}

let paramCounter = 0;

function query(sql, params = []) {
  paramCounter = 0;
  const newSql = sql.replace(/\?/g, () => `$${++paramCounter}`);
  const trimmed = newSql.trim().toUpperCase();
  let finalSql = newSql;
  if (trimmed.startsWith('INSERT') && !trimmed.includes('RETURNING')) {
    finalSql = newSql + ' RETURNING id';
  }
  return pool.query(finalSql, params).then(result => {
    if (trimmed.startsWith('SELECT') || trimmed.startsWith('WITH')) {
      return [result.rows];
    } else {
      return [{ affectedRows: result.rowCount, insertId: result.rows?.[0]?.id || null }];
    }
  });
}

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err.message, err.code || '');
});

module.exports = { query, pool, init };
