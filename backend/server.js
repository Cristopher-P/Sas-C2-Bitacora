// backend/server.js - Punto de entrada simplificado
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const app = require('./app');
const config = require('./config/app.config');
const { setupGlobalErrorHandlers } = require('./middleware/errorHandler');

// Configurar manejadores globales de errores
setupGlobalErrorHandlers();

// Iniciar servidor
const server = app.listen(config.PORT, () => {
    console.log('='.repeat(50));
    console.log(`🚀 ${config.APP_NAME}`);
    console.log('='.repeat(50));
    console.log(`✅ Servidor: http://localhost:${config.PORT}`);
    console.log(`📊 Entorno: ${config.NODE_ENV}`);
    console.log(`🗄️  Base de datos: ${config.DB_NAME}`);
    console.log('👥 Usuarios disponibles:');
    config.MOCK_USERS.forEach(user => {
        console.log(`   ${user.username} / ${user.password} (${user.turno})`);
    });
    console.log('='.repeat(50));
    console.log(`💡 System info: http://localhost:${config.PORT}/api/system-info`);
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