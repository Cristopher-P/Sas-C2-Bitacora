const pool = require('./config/database');

async function migrate() {
    try {
        console.log('Starting migration for Lote A...');

        // 1. System Logs Table
        console.log('Creating system_logs table...');
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS system_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                usuario_id INT,
                accion VARCHAR(100) NOT NULL,
                detalles TEXT,
                fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // 2. IP Restriction on usuarios
        console.log('Adding ip_permitida to usuarios...');
        try {
            await pool.execute('ALTER TABLE usuarios ADD COLUMN ip_permitida VARCHAR(50) DEFAULT NULL');
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') throw e;
            console.log('Column ip_permitida already exists.');
        }

        // 3. Soft deletes on envios_c5
        console.log('Adding soft delete columns to envios_c5...');
        try {
            await pool.execute('ALTER TABLE envios_c5 ADD COLUMN eliminado_en DATETIME DEFAULT NULL');
            await pool.execute('ALTER TABLE envios_c5 ADD COLUMN eliminado_por INT DEFAULT NULL');
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.error(e);
            console.log('Soft delete columns check done on envios_c5.');
        }

        // 4. Soft deletes on all llamadas_bitacora_* tables
        console.log('Fetching llamadas_bitacora tables...');
        const [tables] = await pool.execute("SHOW TABLES LIKE 'llamadas_bitacora%'");
        for (const row of tables) {
            const tableName = Object.values(row)[0];
            console.log(`Adding soft delete columns to ${tableName}...`);
            try {
                await pool.execute(`ALTER TABLE ${tableName} ADD COLUMN eliminado_en DATETIME DEFAULT NULL`);
            } catch (e) {
                if (e.code !== 'ER_DUP_FIELDNAME') console.error(e.message);
            }
            try {
                await pool.execute(`ALTER TABLE ${tableName} ADD COLUMN eliminado_por INT DEFAULT NULL`);
            } catch (e) {
                if (e.code !== 'ER_DUP_FIELDNAME') console.error(e.message);
            }
        }

        console.log('Migration Lote A completed successfully!');
        process.exit(0);
    } catch (e) {
        console.error('Migration failed:', e);
        process.exit(1);
    }
}

migrate();
