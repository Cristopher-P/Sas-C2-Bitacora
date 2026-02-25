const express = require('express');
const router = express.Router();
const LlamadaController = require('../controllers/LlamadaController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/listar', LlamadaController.obtenerLlamadas);
router.get('/geocode', LlamadaController.geocodificarDireccion);

router.post('/registrar', LlamadaController.registrarLlamada);
router.get('/:id', LlamadaController.obtenerLlamada);
router.put('/:id', LlamadaController.actualizarLlamada);
router.delete('/:id', LlamadaController.eliminarLlamada);

router.get('/estadisticas/obtener', LlamadaController.obtenerEstadisticas);
router.get('/autocompletar/obtener', LlamadaController.obtenerAutocompletar);
router.get('/exportar', LlamadaController.exportarLlamadas);

module.exports = router;