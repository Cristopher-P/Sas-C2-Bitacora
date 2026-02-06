// backend/config/database.js
const mysql = require('mysql2');

// Railway NO usa MYSQL_URL, usa variables separadas
const config = {
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: { rejectUnauthorized: false }  // IMPORTANTE para Railway
};

// Debug: Muestra qué variables tenemos
console.log('🔧 Variables MySQL disponibles:');
console.log('- MYSQLHOST:', process.env.MYSQLHOST ? '✅' : '❌ NO DEFINIDA');
console.log('- MYSQLUSER:', process.env.MYSQLUSER ? '✅' : '❌ NO DEFINIDA');
console.log('- MYSQLDATABASE:', process.env.MYSQLDATABASE ? '✅' : '❌ NO DEFINIDA');
console.log('- MYSQLPORT:', process.env.MYSQLPORT || 3306);

// Validación crítica
if (!process.env.MYSQLHOST || !process.env.MYSQLUSER || !process.env.MYSQLDATABASE) {
  console.error('❌ FALTAN VARIABLES DE MYSQL EN RAILWAY');
  console.error('   Ve a Railway → Settings → Variables y verifica que existan:');
  console.error('   - MYSQLHOST');
  console.error('   - MYSQLUSER');
  console.error('   - MYSQLPASSWORD');
  console.error('   - MYSQLDATABASE');
  console.error('   - MYSQLPORT');
  
  // Configuración de fallback para desarrollo
  const fallbackConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'bitacora_dev',
    port: 3306
  };
  console.log('⚠️  Usando configuración de desarrollo');
  Object.assign(config, fallbackConfig);
}

const pool = mysql.createPool(config);

// Test de conexión
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Error conectando a MySQL:', err.message);
    console.error('   Código de error:', err.code);
    console.error('   Número de error:', err.errno);
  } else {
    console.log('✅ Conexión a MySQL exitosa');
    console.log('   Host:', connection.config.host);
    console.log('   Database:', connection.config.database);
    connection.release();
  }
});

module.exports = pool.promise();