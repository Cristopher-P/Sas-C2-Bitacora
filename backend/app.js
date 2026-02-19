// backend/app.js - Configuración de Express separada
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/app.config');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();
app.disable('etag'); // Deshabilitar ETag para evitar 304

// Middleware básico
app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para prevenir caché (Logout seguro)
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../frontend')));

// Importar rutas centralizadas
const apiRoutes = require('./routes/index');
const healthRoutes = require('./routes/healthRoutes');

// Montar rutas
app.use('/api', apiRoutes);
app.use('/api', healthRoutes);

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Manejo de errores
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
