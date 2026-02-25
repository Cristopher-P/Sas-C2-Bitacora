const express = require('express');
const router = express.Router();
const EnvioC5Controller = require('../controllers/EnvioC5Controller');
const authMiddleware = require('../middleware/auth');
const { validarCreacion } = require('../middleware/validators/envioC5Validator');

router.use(authMiddleware);

router.post('/crear', validarCreacion, (req, res, next) => EnvioC5Controller.crearReporte(req, res, next));

router.get('/listar', (req, res) => EnvioC5Controller.obtenerReportes(req, res));

router.get('/:id', (req, res) => EnvioC5Controller.obtenerReporte(req, res));

router.put('/:id/estado', (req, res) => EnvioC5Controller.actualizarEstado(req, res));

router.post('/registrar-folio-c5', (req, res) => EnvioC5Controller.registrarFolioC5(req, res));

router.get('/:id/whatsapp', (req, res) => EnvioC5Controller.generarFormatoWhatsApp(req, res));

router.post('/:id/enviar', (req, res) => EnvioC5Controller.enviarReporteC5(req, res));

router.get('/pendientes/listar', (req, res) => EnvioC5Controller.obtenerPendientes(req, res));

module.exports = router;