require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sas_c4_db'
};

const usuarios = [
    { username: 'admin', pass: 'password123' },
    { username: 'matutino', pass: 'password123' },
    { username: 'vespertino', pass: 'password123' },
    { username: 'nocturno', pass: 'password123' }
];

async function arreglar() {
    console.log('🔌 Conectando a la base de datos...');
    let connection;
    
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Conectado. Actualizando contraseñas en tabla USUARIOS...\n');

        for (const user of usuarios) {
            // 1. Encriptar la contraseña "password123"
            const hashedPassword = await bcrypt.hash(user.pass, 10);
            
            // 2. Actualizar en la base de datos (CAMBIO AQUÍ: 'usuarios')
            // Nota: Asumo que las columnas se llaman 'password' y 'username'.
            // Si te da error de columna, avísame.
            const [result] = await connection.execute(
                'UPDATE usuarios SET password = ? WHERE username = ?',
                [hashedPassword, user.username]
            );

            if (result.affectedRows > 0) {
                console.log(` Usuario [${user.username}] actualizado correctamente.`);
            } else {
                console.log(`  Usuario [${user.username}] no encontrado. (Verifica si el nombre es correcto)`);
            }
        }

        console.log('\n🎉 ¡LISTO! Ahora las contraseñas están encriptadas.');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('💡 Consejo: Verifica si las columnas de tu tabla se llaman "password" y "username"');
    } finally {
        if (connection) await connection.end();
    }
}

arreglar();