// backend/config/database.js - VERSIÓN CORREGIDA
const mysql = require('mysql2');

// ¡CORREGIR LA CONTRASEÑA!
const databaseUrl = process.env.MYSQL_DATABASE_URL || 
  'mysql://root:ifxpXbmEPWLFcMFIqMmOG1xYTEySWkEs@crossover.proxy.rlwy.net:27268/railway';

console.log('🔗 URL de conexión MySQL (segura):', 
  databaseUrl.replace(/:([^:]+)@/, ':***@'));

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
      ssl: { rejectUnauthorized: false },
      connectTimeout: 10000, // 10 segundos timeout
      charset: 'utf8mb4'
    };
  } catch (error) {
    console.error('❌ Error parseando URL de MySQL:', error.message);
    return null;
  }
};

let config = parseDatabaseUrl(databaseUrl);

// Si no se pudo parsear la URL, usar variables individuales
if (!config) {
  config = {
    host: process.env.MYSQLHOST || process.env.MYSQL_HOST || 'crossover.proxy.rlwy.net',
    user: process.env.MYSQLUSER || process.env.MYSQL_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || 'ifxpXbmEPWLFcMFIqMmOG1xYTEySWkEs',
    database: process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || 'railway',
    port: process.env.MYSQLPORT || process.env.MYSQL_PORT || 27268,
    ssl: { rejectUnauthorized: false },
    connectTimeout: 10000,
    charset: 'utf8mb4'
  };
}

console.log('🔧 Configuración MySQL final (segura):', {
  host: config.host,
  database: config.database,
  port: config.port,
  user: config.user,
  passwordLength: config.password ? config.password.length : 0
});

const pool = mysql.createPool(config);

// Test de conexión más detallado
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ ERROR DE CONEXIÓN MYSQL:', {
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState,
      message: err.message,
      address: config.host,
      port: config.port
    });
    
    // Verificación específica de error 1045
    if (err.errno === 1045) {
      console.error('🔐 ERROR DE AUTENTICACIÓN:');
      console.error('   - Usuario:', config.user);
      console.error('   - Contraseña usada:', config.password ? '***' + config.password.slice(-3) : 'NO DEFINIDA');
      console.error('   - Verifica que la contraseña sea EXACTAMENTE:');
      console.error('     ifxpXbmEPWLFcMFIqMmOG1xYTEySWkEs');
      console.error('     (Mayúsculas/minúsculas y números exactos)');
    }
  } else {
    console.log('✅ ¡CONEXIÓN EXITOSA A MYSQL!');
    console.log(`   Host: ${connection.config.host}:${connection.config.port}`);
    console.log(`   Database: ${connection.config.database}`);
    console.log(`   User: ${connection.config.user}`);
    
    // Hacer una consulta de prueba
    connection.query('SELECT 1 + 1 AS result', (queryErr, results) => {
      if (queryErr) {
        console.error('❌ Error en consulta de prueba:', queryErr.message);
      } else {
        console.log(`   Test query: ${results[0].result}`);
      }
      connection.release();
    });
  }
});

module.exports = pool.promise();