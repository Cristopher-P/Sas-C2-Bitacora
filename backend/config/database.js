const mysql = require('mysql2');

const config = {
  host: process.env.MYSQLHOST || 'localhost',
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || '',
  database: process.env.MYSQLDATABASE || 'bitacora_test',
  port: process.env.MYSQLPORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
};

console.log('🔧 MySQL Config:', {
  host: config.host,
  database: config.database,
  port: config.port
});

const pool = mysql.createPool(config);

// Test connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ MySQL Connection Error:', err.message);
  } else {
    console.log('✅ Connected to MySQL');
    connection.release();
  }
});

module.exports = pool.promise();