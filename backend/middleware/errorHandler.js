// backend/middleware/errorHandler.js
const config = require('../config/app.config');

// Manejo de errores 404
function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada',
        path: req.originalUrl
    });
}

// Manejo de errores del servidor
function errorHandler(err, req, res, next) {
    console.error('❌ Server error:', err);
    
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Error interno del servidor';
    
    res.status(statusCode).json({
        success: false,
        message: message,
        error: config.NODE_ENV === 'development' ? err.stack : undefined
    });
}

// Manejo de excepciones no capturadas
function setupGlobalErrorHandlers() {
    process.on('uncaughtException', (error) => {
        console.error('🔥 UNCAUGHT EXCEPTION:', error);
        process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
        console.error('🔥 UNHANDLED REJECTION at:', promise, 'reason:', reason);
    });
}

module.exports = {
    notFoundHandler,
    errorHandler,
    setupGlobalErrorHandlers
};
