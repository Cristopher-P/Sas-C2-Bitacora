// backend/routes/index.js - Centralizador de rutas
const express = require('express');
const router = express.Router();

// Importar todas las rutas
const authRoutes = require('./authRoutes');
const llamadasRoutes = require('./llamadasRoutes');
const enviosC5Routes = require('./enviosC5Routes');
const exportRoutes = require('./exportRoutes');

// Montar rutas
router.use('/auth', authRoutes);
router.use('/llamadas', llamadasRoutes);
router.use('/c5', enviosC5Routes);
router.use('/export', exportRoutes);

module.exports = router;
