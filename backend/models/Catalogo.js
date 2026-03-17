const pool = require('../config/database');

class Catalogo {
    static async ensureTableExists() {
        const sql = `
            CREATE TABLE IF NOT EXISTS catalogos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                tipo VARCHAR(50) NOT NULL,
                valor VARCHAR(255) NOT NULL,
                activo BOOLEAN DEFAULT true,
                creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_tipo (tipo)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;
        await pool.execute(sql);
        
        // Seed initial data if empty
        const [rows] = await pool.execute('SELECT COUNT(*) as count FROM catalogos');
        if (rows[0].count === 0) {
            await this.seedInitialData();
        }
    }

    static async seedInitialData() {
        const initialData = [
            { tipo: 'motivo_llamada', valor: 'Emergencia Médica' },
            { tipo: 'motivo_llamada', valor: 'Accidente de Tráfico' },
            { tipo: 'motivo_llamada', valor: 'Robo en Progreso' },
            { tipo: 'motivo_llamada', valor: 'Violencia Familiar' },
            { tipo: 'motivo_llamada', valor: 'Incendio' },
            { tipo: 'motivo_llamada', valor: 'Alteración al Orden' },
            { tipo: 'motivo_llamada', valor: 'Persona Sospechosa' },
            { tipo: 'motivo_llamada', valor: 'Falsa Alarma / Broma' },
            { tipo: 'motivo_llamada', valor: 'Apoyo a la Ciudadanía' }
        ];

        for (const item of initialData) {
            await pool.execute(
                'INSERT INTO catalogos (tipo, valor) VALUES (?, ?)',
                [item.tipo, item.valor]
            );
        }
    }

    static async getAll(tipo = null) {
        await this.ensureTableExists();
        
        let sql = 'SELECT * FROM catalogos ORDER BY tipo, valor';
        const params = [];
        
        if (tipo) {
            sql = 'SELECT * FROM catalogos WHERE tipo = ? AND activo = true ORDER BY valor';
            params.push(tipo);
        }
        
        const [rows] = await pool.execute(sql, params);
        return rows;
    }

    static async create(tipo, valor) {
        const sql = 'INSERT INTO catalogos (tipo, valor) VALUES (?, ?)';
        const [result] = await pool.execute(sql, [tipo, valor]);
        return result.insertId;
    }

    static async update(id, valor, activo) {
        const sql = 'UPDATE catalogos SET valor = ?, activo = ? WHERE id = ?';
        await pool.execute(sql, [valor, activo, id]);
        return true;
    }

    static async delete(id) {
        const sql = 'DELETE FROM catalogos WHERE id = ?';
        await pool.execute(sql, [id]);
        return true;
    }
}

module.exports = Catalogo;
