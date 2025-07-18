const mysql = require('mysql2');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'espoch_docs',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

// Test connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Error conectando a MySQL:', err.message);
    console.log('💡 Asegúrate de que MySQL esté ejecutándose y la base de datos exista');
  } else {
    console.log('✅ Conectado a MySQL exitosamente');
    connection.release();
  }
});

// Export promise-based pool
module.exports = pool.promise();
