// backend/config/database.js
const mysql = require('mysql2');

// URL PÚBLICA que Railway te da
const databaseUrl = process.env.MYSQL_DATABASE_URL || 
  'mysql://root:ifxpXbmEPWLFcMFIqMmOG1xYTEySWkEs@crossover.proxy.rlwy.net:27268/railway';

console.log('🔗 URL de conexión MySQL:', databaseUrl.replace(/:[^:]*@/, ':***@'));

// Parsear la URL
const parseDatabaseUrl = (url) => {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      user: parsed.username,
      password: parsed.password,
      database: parsed.pathname.substring(1),
      port: parsed.port || 3306,
      ssl: { rejectUnauthorized: false }
    };
  } catch (error) {
    console.error('❌ Error parseando URL de MySQL:', error.message);
    return null;
  }
};

const config = parseDatabaseUrl(databaseUrl) || {
  // Fallback a variables individuales (con los nombres CORRECTOS)
  host: process.env.MYSQLHOST || process.env.MYSQL_HOST,
  user: process.env.MYSQLUSER || process.env.MYSQL_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD,
  database: process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || 'railway',
  port: process.env.MYSQLPORT || process.env.MYSQL_PORT || 3306,
  ssl: { rejectUnauthorized: false }
};

console.log('🔧 Configuración MySQL final:', {
  host: config.host,
  database: config.database,
  port: config.port,
  user: config.user
});

const pool = mysql.createPool(config);

// Test de conexión
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Error conectando a MySQL:', {
      message: err.message,
      code: err.code,
      host: config.host,
      port: config.port
    });
    
    // Si falla, probar con localhost para desarrollo
    console.log('⚠️  Intentando conexión local...');
  } else {
    console.log('✅ ¡CONEXIÓN EXITOSA A MYSQL!');
    console.log(`   Host: ${connection.config.host}`);
    console.log(`   Database: ${connection.config.database}`);
    connection.release();
  }
});

module.exports = pool.promise();