
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const app = require('./app');
const config = require('./config/app.config');
const { setupGlobalErrorHandlers } = require('./middleware/errorHandler');

setupGlobalErrorHandlers();

const server = app.listen(config.PORT, () => {
    console.log('='.repeat(50));
    console.log(`🚀 ${config.APP_NAME}`);
    console.log('='.repeat(50));
    console.log(`✅ Servidor HTTP: http://localhost:${config.PORT}`);
    console.log(`📊 Entorno: ${config.NODE_ENV}`);
    console.log(`🗄️  Base de datos: ${config.DB_NAME}`);
    console.log('👥 Usuarios disponibles:');
    config.MOCK_USERS.forEach(user => {
        console.log(`   ${user.username} / ${user.password} (${user.turno})`);
    });
    console.log('='.repeat(50));
    console.log(`💡 System info: http://localhost:${config.PORT}/api/system-info`);
    console.log('='.repeat(50));

    const io = require('socket.io')(server, {
        cors: {
            origin: config.CORS_ORIGIN,
            methods: ["GET", "POST"]
        }
    });

    app.set('socketio', io);

    io.on('connection', (socket) => {
        console.log(`🔌 Cliente conectado a Sockets: ${socket.id}`);
        socket.on('disconnect', () => {
            console.log(`🔌 Cliente desconectado de Sockets: ${socket.id}`);
        });
    });

    console.log(`✅ Servidor WebSockets Iniciado`);
    console.log('='.repeat(50));

    try {
        const ResponseWorker = require('./services/ResponseWorker');
        const worker = new ResponseWorker(io);
        worker.start();
    } catch (err) {
        console.error('⚠️ Error iniciando ResponseWorker:', err.message);
    }
});

process.on('SIGTERM', () => {
    console.log('🔄 Recibida señal SIGTERM, cerrando servidor...');
    server.close(() => {
        console.log('✅ Servidor cerrado');
        process.exit(0);
    });
});

module.exports = server;