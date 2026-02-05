const pool = require('./config/database');

async function migrate() {
    try {
        console.log('Iniciando migración de base de datos...');
        
        // 1. Verificar si las columnas ya existen
        const [columns] = await pool.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'llamadas_bitacora' 
            AND COLUMN_NAME IN ('latitud', 'longitud', 'ubicacion_exacta');
        `);
        
        const existingColumns = columns.map(c => c.COLUMN_NAME);
        
        const queries = [];
        
        if (!existingColumns.includes('latitud')) {
            queries.push("ADD COLUMN latitud DECIMAL(10, 8) NULL");
        }
        if (!existingColumns.includes('longitud')) {
            queries.push("ADD COLUMN longitud DECIMAL(11, 8) NULL");
        }
        if (!existingColumns.includes('ubicacion_exacta')) {
            queries.push("ADD COLUMN ubicacion_exacta BOOLEAN DEFAULT 0");
        }
        
        if (queries.length > 0) {
            const sql = `ALTER TABLE llamadas_bitacora ${queries.join(', ')}`;
            console.log('Ejecutando SQL:', sql);
            await pool.execute(sql);
            console.log('✅ Columnas agregadas exitosamente.');
        } else {
            console.log('ℹ️ Las columnas ya existen. No se requieren cambios.');
        }
        
    } catch (error) {
        console.error('❌ Error en la migración:', error);
    } finally {
        process.exit();
    }
}

migrate();
