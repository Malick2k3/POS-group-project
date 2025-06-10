const mysql = require('mysql2');
const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

async function initializeDatabase() {
  let connection;
  try {
    // Create connection without database
    connection = mysql.createConnection({
      host: '127.0.0.1',  // Use IP instead of localhost
      port: 3306,         // Explicitly specify port
      user: 'root',
      password: 'neymarjr10',
      connectTimeout: 10000 // 10 seconds timeout
    });

    // Test the connection
    await new Promise((resolve, reject) => {
      connection.connect((err) => {
        if (err) {
          if (err.code === 'ECONNREFUSED') {
            console.error('\nMySQL server is not running. Please follow these steps:');
            console.error('1. Open Command Prompt as Administrator');
            console.error('2. Run these commands:');
            console.error('   net stop MySQL80');
            console.error('   net start MySQL80');
            console.error('3. If MySQL is not installed, download and install from:');
            console.error('   https://dev.mysql.com/downloads/installer/');
            reject(err);
          } else {
            console.error('Error connecting to MySQL:', err.message);
            reject(err);
          }
          return;
        }
        console.log('Connected to MySQL server successfully');
        resolve();
      });
    });

    // Read and execute the SQL file
    const sqlFile = await fs.readFile(
      path.join(__dirname, 'database.sql'),
      'utf8'
    );

    // Split the SQL file into individual statements
    const statements = sqlFile
      .split(';')
      .filter(statement => statement.trim());

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        await new Promise((resolve, reject) => {
          connection.query(statement, (error, results) => {
            if (error) {
              console.error('Error executing statement:', error.message);
              reject(error);
              return;
            }
            resolve(results);
          });
        });
      }
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error.message);
    process.exit(1); // Exit with error code
  } finally {
    if (connection && connection.state !== 'disconnected') {
      connection.end();
    }
  }
}

// Run the initialization
initializeDatabase().catch(() => process.exit(1)); 