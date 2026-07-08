let db;
if (process.env.DATABASE_URL) {
  db = require('./postgres');
} else {
  db = require('./sqlite');
  db.init = async () => {}; // sqlite doesn't need async init, tables exist
  console.log('DATABASE_URL not set, using SQLite (data will not persist across restarts)');
}
module.exports = db;
