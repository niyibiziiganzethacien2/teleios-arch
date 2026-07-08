let db;
if (process.env.DATABASE_URL) {
  db = require('./postgres');
  db.init = async () => { await db.pool.query('SELECT 1'); };
} else {
  db = require('./sqlite');
  db.init = async () => { await db.readyPromise; };
  console.log('DATABASE_URL not set, using SQLite (data will not persist across restarts)');
}
module.exports = db;
