// backend/config/database.js - SISTEMA INTELIGENTE CON FALLBACK
const mysql = require('mysql2');

let isDBConnected = false;
let pool = null;

<<<<<<< HEAD
// Configuración de MySQL
const config = {
    host: process.env.MYSQLHOST || process.env.MYSQL_HOST || 'crossover.proxy.rlwy.net',
    user: process.env.MYSQLUSER || process.env.MYSQL_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || 'ifxpXbmEPWLFcMFIqMmOG1xYTEySWkEs',
    database: process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || 'railway',
    port: process.env.MYSQLPORT || process.env.MYSQL_PORT || 27268,
    ssl: { rejectUnauthorized: false },
    connectTimeout: 5000, // timeout 5 segundos
    charset: 'utf8mb4'
};
=======

>>>>>>> develop

console.log('🔧 Configuración MySQL:', {
    host: config.host,
    database: config.database,
    port: config.port,
    user: config.user
});

<<<<<<< HEAD
// Intentar crear pool
try {
    pool = mysql.createPool(config);
    
    // Test de conexión
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('❌ MySQL ERROR:', err.code, err.message);
            console.warn('⚠️  MODO MOCK ACTIVADO - Usando datos de prueba');
            isDBConnected = false;
        } else {
            console.log('✅ MySQL CONECTADO');
            isDBConnected = true;
            connection.release();
        }
    });
} catch (error) {
    console.error('❌ Error creando pool:', error.message);
    console.warn('⚠️  MODO MOCK ACTIVADO');
    isDBConnected = false;
}

// Intentar reconectar cada 30 segundos
setInterval(() => {
    if (!isDBConnected && pool) {
        pool.getConnection((err, connection) => {
            if (!err) {
                console.log('✅ MySQL RECONECTADO');
                isDBConnected = true;
                connection.release();
            }
        });
=======
// Probar conexión
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Error conectando a MySQL:', err.message);
    } else {
        connection.release();
>>>>>>> develop
    }
}, 30000);

// Wrapper que retorna funciones mock o reales
const db = {
    // Indicador de conexión
    isConnected: () => isDBConnected,
    
    // Execute con fallback
    execute: async (sql, params = []) => {
        if (isDBConnected && pool) {
            try {
                const promisePool = pool.promise();
                return await promisePool.execute(sql, params);
            } catch (error) {
                console.error('❌ Error en execute:', error.message);
                isDBConnected = false;
                throw error;
            }
        }
        
        // Mock: retornar array vacío
        console.warn('⚠️  Mock execute llamado:', sql.substring(0, 50));
        return [[], null];
    },
    
    // Query con fallback
    query: async (sql, params = []) => {
        if (isDBConnected && pool) {
            try {
                const promisePool = pool.promise();
                return await promisePool.query(sql, params);
            } catch (error) {
                console.error('❌ Error en query:', error.message);
                isDBConnected = false;
                throw error;
            }
        }
        
        // Mock: retornar array vacío
        console.warn('⚠️  Mock query llamado:', sql.substring(0, 50));
        return [[], null];
    },
    
    // Getter para el pool (usado en server.js)
    getPool: () => pool
};

module.exports = db;