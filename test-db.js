require('dotenv').config();
const mysql = require('mysql2');

console.log('🔄 Probando conexión a Base de Datos SAS C4...');
console.log(`📡 Host: ${process.env.DB_HOST}`);
console.log(`👤 User: ${process.env.DB_USER}`);
console.log(`🗄️  DB:   ${process.env.DB_NAME}`);

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

connection.connect((err) => {
    if (err) {
        console.error('❌ ERROR FATAL DE CONEXIÓN:');
        console.error(`   Código: ${err.code}`);
        console.error(`   Mensaje: ${err.message}`);

        if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('\n💡 PISTA: La contraseña o usuario son incorrectos.');
        } else if (err.code === 'ECONNREFUSED') {
            console.log('\n💡 PISTA: MySQL no se está ejecutando o el puerto es incorrecto.');
        }
        process.exit(1);
    }

    console.log('✅ Conexión al servidor MySQL exitosa.');

    connection.query(`SHOW DATABASES LIKE '${process.env.DB_NAME}'`, (err, results) => {
        if (err) {
            console.error('❌ Error buscando base de datos:', err);
            process.exit(1);
        }

        if (results.length === 0) {
            console.error(`❌ La base de datos "${process.env.DB_NAME}" NO EXISTE.`);
            console.log('💡 Debes crearla e importar el esquema.');
            process.exit(1);
        }

        console.log(`✅ Base de datos "${process.env.DB_NAME}" encontrada.`);

        connection.changeUser({ database: process.env.DB_NAME }, (err) => {
            if (err) {
                console.error('❌ Error cambiando a la BD:', err);
                process.exit(1);
            }

            connection.query("SHOW TABLES LIKE 'usuarios'", (err, results) => {
                if (results.length === 0) {
                    console.error('❌ La tabla "usuarios" NO EXISTE.');
                    console.log('💡 Ejecuta el script SQL para crear las tablas.');
                } else {
                    console.log('✅ Tabla "usuarios" encontrada.');

                    connection.query("SELECT count(*) as count FROM usuarios", (err, results) => {
                        console.log(`✅ Hay ${results[0].count} usuarios registrados.`);
                        connection.end();
                    });
                }
            });
        });
    });
});
