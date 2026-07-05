const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'teleios_architecture',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.getConnection()
  .then(conn => { conn.release(); console.log('MySQL connected'); })
  .catch(err => { console.error('MySQL connection failed:', err.message); });

module.exports = pool;
