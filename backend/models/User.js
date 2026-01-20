const pool = require('../config/database');

class User {
    static async findByUsername(username) {
        const sql = 'SELECT * FROM usuarios WHERE username = ?';
        const [rows] = await pool.execute(sql, [username]);
        return rows[0];
    }

    static async findById(id) {
        const sql = 'SELECT id, username, nombre_completo, turno, rol FROM usuarios WHERE id = ?';
        const [rows] = await pool.execute(sql, [id]);
        return rows[0];
    }

    static async create(userData) {
        const sql = `
            INSERT INTO usuarios (username, password, nombre_completo, turno, rol)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await pool.execute(sql, [
            userData.username,
            userData.password,
            userData.nombre_completo,
            userData.turno,
            userData.rol || 'supervisor'
        ]);
        return result.insertId;
    }
}

module.exports = User;