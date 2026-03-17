const pool = require('../config/database');

class Configuracion {
    static async ensureTableExists() {
        const sql = `
            CREATE TABLE IF NOT EXISTS configuraciones (
                id INT AUTO_INCREMENT PRIMARY KEY,
                clave VARCHAR(50) UNIQUE NOT NULL,
                valor TEXT NOT NULL,
                actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;
        await pool.execute(sql);
    }

    static async get(clave) {
        await this.ensureTableExists();
        const sql = 'SELECT valor FROM configuraciones WHERE clave = ?';
        const [rows] = await pool.execute(sql, [clave]);
        if (rows.length > 0) {
            try {
                return JSON.parse(rows[0].valor);
            } catch (e) {
                return rows[0].valor;
            }
        }
        return null; // Null if not set
    }

    static async set(clave, valor) {
        await this.ensureTableExists();
        const valorString = typeof valor === 'object' ? JSON.stringify(valor) : String(valor);
        const sql = `
            INSERT INTO configuraciones (clave, valor)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE valor = ?
        `;
        await pool.execute(sql, [clave, valorString, valorString]);
        return true;
    }
}

module.exports = Configuracion;
