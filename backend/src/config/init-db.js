const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const mysql = require('mysql2/promise');
const path = require('path');
const { randomUUID } = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

const connectionConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || ''
};

const defaultAdmin = {
  fullName: process.env.DEFAULT_ADMIN_NAME || 'Store Admin',
  email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@modernpos.local',
  pin: process.env.DEFAULT_ADMIN_PIN || '1234'
};

async function initializeDatabase() {
  let connection;

  try {
    connection = await mysql.createConnection(connectionConfig);

    const sqlFile = await fs.readFile(path.join(__dirname, 'database.sql'), 'utf8');
    const statements = sqlFile
      .split(';')
      .map((statement) => statement.trim())
      .filter(Boolean);

    for (const statement of statements) {
      await connection.query(statement);
    }

    await connection.query(`USE ${process.env.DB_NAME || 'modern_pos'}`);

    const [admins] = await connection.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [defaultAdmin.email]
    );

    if (admins.length === 0) {
      const pinHash = await bcrypt.hash(defaultAdmin.pin, 10);
      await connection.query(
        `INSERT INTO users (id, full_name, email, pin_hash, role, is_active)
         VALUES (?, ?, ?, ?, 'admin', TRUE)`,
        [randomUUID(), defaultAdmin.fullName, defaultAdmin.email, pinHash]
      );
      console.log(`Seeded admin user ${defaultAdmin.email}`);
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error.message);
    process.exitCode = 1;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initializeDatabase();
