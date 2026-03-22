const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

dotenv.config();

const databaseConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'modern_pos',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0
};

const pool = mysql.createPool(databaseConfig);

async function testConnection() {
  const connection = await pool.getConnection();
  connection.release();
}

async function getConnectionHealth() {
  const startedAt = Date.now();
  const connection = await pool.getConnection();

  try {
    await connection.query('SELECT 1');
    return {
      status: 'ok',
      latencyMs: Date.now() - startedAt
    };
  } finally {
    connection.release();
  }
}

async function closePool() {
  await pool.end();
}

module.exports = {
  pool,
  testConnection,
  getConnectionHealth,
  closePool,
  databaseConfig
};
