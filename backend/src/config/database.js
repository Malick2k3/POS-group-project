const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// Create the connection pool
const pool = mysql.createPool({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: 'neymarjr10',
  database: 'daust_marketplace',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.error('\nMySQL server is not running. Please follow these steps:');
      console.error('1. Open Command Prompt as Administrator');
      console.error('2. Run these commands:');
      console.error('   net stop MySQL80');
      console.error('   net start MySQL80');
      console.error('3. If MySQL is not installed, download and install from:');
      console.error('   https://dev.mysql.com/downloads/installer/');
    }
    process.exit(1);
  }
  console.log('Successfully connected to MySQL database');
  connection.release();
});

// Convert pool to use promises
const promisePool = pool.promise();

module.exports = promisePool; 