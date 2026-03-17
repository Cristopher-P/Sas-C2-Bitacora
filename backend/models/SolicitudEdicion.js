const pool = require('../config/database');

class SolicitudEdicion {
    static async ensureTableExists() {
        const sql = `
            CREATE TABLE IF NOT EXISTS solicitudes_edicion (
                id INT AUTO_INCREMENT PRIMARY KEY,
                modulo VARCHAR(50) NOT NULL COMMENT 'llamadas_bitacora o envios_c5',
                registro_id INT NOT NULL,
                usuario_id INT NOT NULL,
                datos_nuevos JSON NOT NULL,
                estado ENUM('pendiente', 'aprobada', 'rechazada') DEFAULT 'pendiente',
                creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
                resuelto_en DATETIME NULL,
                resuelto_por INT NULL,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;
        await pool.execute(sql);
    }

    static async create(modulo, registroId, usuarioId, datosNuevos) {
        await this.ensureTableExists();
        const sql = `
            INSERT INTO solicitudes_edicion 
            (modulo, registro_id, usuario_id, datos_nuevos) 
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await pool.execute(sql, [modulo, registroId, usuarioId, JSON.stringify(datosNuevos)]);
        return result.insertId;
    }

    static async getPendientes() {
        await this.ensureTableExists();
        const sql = `
            SELECT s.*, u.username as solicitante 
            FROM solicitudes_edicion s
            JOIN usuarios u ON s.usuario_id = u.id
            WHERE s.estado = 'pendiente'
            ORDER BY s.creado_en DESC
        `;
        const [rows] = await pool.execute(sql);
        return rows;
    }

    static async getById(id) {
        await this.ensureTableExists();
        const sql = `SELECT * FROM solicitudes_edicion WHERE id = ?`;
        const [rows] = await pool.execute(sql, [id]);
        return rows[0] || null;
    }

    static async resolver(id, estado, resueltoPor) {
        const sql = `
            UPDATE solicitudes_edicion 
            SET estado = ?, resuelto_en = CURRENT_TIMESTAMP, resuelto_por = ? 
            WHERE id = ?
        `;
        await pool.execute(sql, [estado, resueltoPor, id]);
        return true;
    }
}

module.exports = SolicitudEdicion;
