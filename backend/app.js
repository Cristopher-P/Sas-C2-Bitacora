// backend/app.js - Configuración de Express separada
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/app.config');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware básico
app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
