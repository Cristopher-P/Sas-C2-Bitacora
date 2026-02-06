require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

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
app.listen(PORT, () => {
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
});