let db;
if (process.env.DATABASE_URL) {
  db = require('./postgres');
  console.log('Using PostgreSQL (persistent storage)');
} else {
  db = require('./file');
  console.log('Using file-based JSON storage (no native modules)');
}
module.exports = db;
