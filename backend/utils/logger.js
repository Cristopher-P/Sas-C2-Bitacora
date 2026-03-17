const pool = require('../config/database');

class SystemLogger {
    /**
     * @param {number} usuario_id
     * @param {string} accion 
     * @param {string|object} detalles 
     */
    static async log(usuario_id, accion, detalles = '') {
        try {
            const detallesStr = typeof detalles === 'object' ? JSON.stringify(detalles) : detalles;
            const sql = 'INSERT INTO system_logs (usuario_id, accion, detalles) VALUES (?, ?, ?)';
            await pool.execute(sql, [usuario_id || null, accion, detallesStr]);
        } catch (error) {
            console.error('Error guardando system log:', error);
        }
    }
}

module.exports = SystemLogger;
