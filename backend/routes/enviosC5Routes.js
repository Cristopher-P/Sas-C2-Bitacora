const express = require('express');
const router = express.Router();
const EnvioC5Controller = require('../controllers/EnvioC5Controller');
const authMiddleware = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// ==========================================
// RUTAS PARA REPORTES C5
// ==========================================

// Crear nuevo reporte C5
router.post('/crear', (req, res) => EnvioC5Controller.crearReporte(req, res));

// Obtener todos los reportes
router.get('/listar', (req, res) => EnvioC5Controller.obtenerReportes(req, res));

// Obtener reporte específico
router.get('/:id', (req, res) => EnvioC5Controller.obtenerReporte(req, res));

// Actualizar estado
router.put('/:id/estado', (req, res) => EnvioC5Controller.actualizarEstado(req, res));

// Registrar folio C5 (respuesta del C5)
router.post('/registrar-folio-c5', (req, res) => EnvioC5Controller.registrarFolioC5(req, res));

// Generar formato WhatsApp
router.get('/:id/whatsapp', (req, res) => EnvioC5Controller.generarFormatoWhatsApp(req, res));

// Pendientes
router.get('/pendientes/listar', (req, res) => EnvioC5Controller.obtenerPendientes(req, res));

module.exports = router;