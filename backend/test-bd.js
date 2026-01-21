// backend/test-db.js
const pool = require('./config/database');

async function testConnection() {
    try {
        console.log('🔍 Probando conexión a MySQL...');
        
        // 1. Probar conexión básica
        const [rows] = await pool.execute('SELECT 1 + 1 AS result');
        console.log('✅ Conexión MySQL OK:', rows[0].result);
        
        // 2. Verificar tabla envios_c5
        const [tables] = await pool.execute('SHOW TABLES');
        console.log('📊 Tablas encontradas:');
        tables.forEach(table => {
            console.log('   -', table[Object.keys(table)[0]]);
        });
        
        // 3. Verificar estructura de envios_c5
        const [columns] = await pool.execute('DESCRIBE envios_c5');
        console.log('📋 Columnas de envios_c5:');
        columns.forEach(col => {
            console.log(`   ${col.Field} (${col.Type})`);
        });
        
        // 4. Contar registros existentes
        const [count] = await pool.execute('SELECT COUNT(*) as total FROM envios_c5');
        console.log(`📈 Total de reportes: ${count[0].total}`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error conectando a MySQL:', error.message);
        console.log('🔧 Solución:');
        console.log('   1. Asegúrate que MySQL esté corriendo');
        console.log('   2. Verifica las credenciales en .env');
        console.log('   3. Verifica que la base de datos exista');
        process.exit(1);
    }
}

testConnection();