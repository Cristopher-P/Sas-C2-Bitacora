require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '261105',
    database: process.env.DB_NAME || 'sas_c4_db'
};

const usuarios = [
    { username: 'admin', pass: 'admin123', nombre: 'Administrador', turno: 'matutino', rol: 'admin' },
    { username: 'matutino', pass: 'password123', nombre: 'Turno Matutino', turno: 'matutino', rol: 'supervisor' },
    { username: 'vespertino', pass: 'password123', nombre: 'Turno Vespertino', turno: 'vespertino', rol: 'supervisor' },
    { username: 'nocturno', pass: 'password123', nombre: 'Turno Nocturno', turno: 'nocturno', rol: 'supervisor' }
];

async function insertarUsuarios() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Conectado. Insertando usuarios...');

        for (const user of usuarios) {
            const hashedPassword = await bcrypt.hash(user.pass, 10);

            // Insert ignore per username duplicate risk
            const [result] = await connection.execute(
                `INSERT IGNORE INTO usuarios (username, password, nombre_completo, turno, rol) VALUES (?, ?, ?, ?, ?)`,
                [user.username, hashedPassword, user.nombre, user.turno, user.rol]
            );

            if (result.affectedRows > 0) {
                console.log(`Usuario [${user.username}] creado correctamente.`);
            } else {
                console.log(`Usuario [${user.username}] ya existía.`);
            }
        }
        console.log('Finalizado.');
    } catch (error) {
        console.error('Error insertando usuarios:', error);
    } finally {
        if (connection) await connection.end();
    }
}

insertarUsuarios();
