require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

// ========== SISTEMA AUTOMÁTICO DE HASH DE CONTRASEÑAS ==========
async function inicializarSistemaContraseñas() {
    console.log('🔄 Inicializando sistema de contraseñas...');
    
    try {
        // Importar después de dotenv para que las variables estén disponibles
        const pool = require('./config/database');
        
        // 1. Verificar si la tabla usuarios existe
        const [tables] = await pool.execute(
            "SHOW TABLES LIKE 'usuarios'"
        );
        
        if (tables.length === 0) {
            console.log('📦 Tabla usuarios no existe, creándola...');
            
            await pool.execute(`
                CREATE TABLE IF NOT EXISTS usuarios (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    nombre_completo VARCHAR(100) NOT NULL,
                    turno VARCHAR(50),
                    rol VARCHAR(50) DEFAULT 'supervisor',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            
            console.log('✅ Tabla usuarios creada');
            
            // Insertar usuarios con contraseñas en texto plano
            await pool.execute(`
                INSERT IGNORE INTO usuarios (username, password, nombre_completo, turno, rol) 
                VALUES 
                ('admin', 'password123', 'Administrador', 'Todos', 'admin'),
                ('matutino', 'password123', 'Turno Matutino', 'Matutino', 'supervisor'),
                ('vespertino', 'password123', 'Turno Vespertino', 'Vespertino', 'supervisor'),
                ('nocturno', 'password123', 'Turno Nocturno', 'Nocturno', 'supervisor')
            `);
            
            console.log('✅ Usuarios creados (contraseñas en texto plano)');
        }
        
        // 2. Buscar usuarios con contraseñas en texto plano
        const [users] = await pool.execute(
            "SELECT id, username, password FROM usuarios WHERE password NOT LIKE '$2a$%' AND password NOT LIKE '$2b$%'"
        );
        
        console.log(`🔍 Usuarios a hashear encontrados: ${users.length}`);
        
        if (users.length > 0) {
            console.log('🔐 Hasheando contraseñas en texto plano...');
            
            for (const user of users) {
                console.log(`   - Procesando: ${user.username}`);
                
                try {
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(user.password, salt);
                    
                    await pool.execute(
                        'UPDATE usuarios SET password = ? WHERE id = ?',
                        [hashedPassword, user.id]
                    );
                    
                    console.log(`     ✅ ${user.username} - Contraseña hasheada`);
                } catch (hashError) {
                    console.log(`     ❌ Error hasheando ${user.username}:`, hashError.message);
                }
            }
            
            console.log('🎉 ¡Proceso de hash completado!');
            console.log('🔐 Ahora puedes usar la contraseña: password123');
        } else {
            console.log('✅ Todas las contraseñas ya están hasheadas');
        }
        
    } catch (error) {
        console.log('⚠️  No se pudo inicializar sistema de contraseñas:', error.message);
        console.log('   La aplicación continuará en modo normal');
    }
}

// Inicializar en segundo plano (no bloquear el servidor)
inicializarSistemaContraseñas().then(() => {
    console.log('✅ Sistema de contraseñas inicializado');
}).catch(err => {
    console.log('⚠️  Error en inicialización:', err.message);
});

process.on('uncaughtException', (error) => {
    console.error('🔥 UNCAUGHT EXCEPTION:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🔥 UNHANDLED REJECTION at:', promise, 'reason:', reason);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../frontend')));

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const llamadasRoutes = require('./routes/llamadasRoutes');
const enviosC5Routes = require('./routes/enviosC5Routes');
const db = require('./config/database'); // ajusta la ruta si es distinta

// Endpoint de prueba
app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 AS ok');
    res.json({ db: 'connected', rows });
  } catch (err) {
    console.error('DB ERROR:', err);
    res.status(500).json({ error: err.message });
  }
});

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/llamadas', llamadasRoutes);
app.use('/api/c5', enviosC5Routes);

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Ruta de estado
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        system: 'SAS C4 - Bitácora de Llamadas',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Ruta de información del sistema
app.get('/api/system-info', async (req, res) => {
    try {
        const pool = require('./config/database');
        const [users] = await pool.execute('SELECT COUNT(*) as count FROM usuarios');
        const [hashed] = await pool.execute("SELECT COUNT(*) as count FROM usuarios WHERE password LIKE '$2a$%' OR password LIKE '$2b$%'");
        
        res.json({
            status: 'online',
            users: users[0].count,
            hashedPasswords: hashed[0].count,
            environment: process.env.NODE_ENV || 'development',
            database: process.env.MYSQLDATABASE || 'sas_c4_db',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.json({
            status: 'online',
            database: 'no disponible',
            message: 'Modo mock activado',
            timestamp: new Date().toISOString()
        });
    }
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

// Manejo de errores del servidor
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Iniciar servidor
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(50));
    console.log('🚀 SAS C4 - Bitácora de Llamadas');
    console.log('='.repeat(50));
    console.log(`✅ Servidor: http://localhost:${PORT}`);
    console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️  Base de datos: ${process.env.MYSQLDATABASE || 'sas_c4_db'}`);
    console.log('👥 Usuarios disponibles:');
    console.log('   admin / password123 (Administrador)');
    console.log('   matutino / password123 (Turno Matutino)');
    console.log('   vespertino / password123 (Turno Vespertino)');
    console.log('   nocturno / password123 (Turno Nocturno)');
    console.log('='.repeat(50));
    console.log('💡 Para verificar estado: http://localhost:' + PORT + '/api/system-info');
    console.log('='.repeat(50));
});

// Manejo de cierre limpio
process.on('SIGTERM', () => {
    console.log('🔄 Recibida señal SIGTERM, cerrando servidor...');
    server.close(() => {
        console.log('✅ Servidor cerrado');
        process.exit(0);
    });
});

module.exports = server;