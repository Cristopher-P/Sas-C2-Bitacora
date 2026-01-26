const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

console.log(' Configurando conexión MySQL...');

// Configuración de la base de datos
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sas_c4_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Probar conexión
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Error conectando a MySQL:', err.message);
        console.log('⚠️  Verifica:');
        console.log('   1. MySQL está corriendo (sudo service mysql start)');
        console.log('   2. Credenciales en .env son correctas');
        console.log('   3. Base de datos existe');
    } else {
        console.log('Conectado a MySQL correctamente ');
        connection.release();
    }
});

// Exportar pool con promesas
module.exports = pool.promise();