const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const CatalogoController = require('../controllers/CatalogoController');
const { verifyToken } = require('../controllers/authController');

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.rol !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado: Se requieren permisos de administrador'
        });
    }
    next();
};

// Protect all /api/admin routes
router.use(verifyToken);
router.use(requireAdmin);

// Dashboard routes
router.get('/users', AdminController.getAllUsers);
router.post('/users', AdminController.createUser);
router.put('/users/:id', AdminController.updateUserName);
router.put('/users/:id/password', AdminController.updateUserPassword);

// Reset diario (Ajustes de Sistema)
router.get('/settings', AdminController.getSettings);
router.put('/settings', AdminController.updateSettings);

// API Lote A (Logs, Papelera, Kardex)
router.get('/logs', AdminController.getSystemLogs);
router.get('/trash', AdminController.getTrash);
router.put('/trash/restore', AdminController.restoreTrash);
router.get('/kardex', AdminController.getKardex);

// API Lote B (WebSockets)
router.post('/force-logout', AdminController.forceLogout);
router.post('/broadcast', AdminController.broadcastMessage);

// API Lote C (Gestión de Catálogos)
router.get('/catalogos', CatalogoController.getAll);
router.post('/catalogos', CatalogoController.create);
router.put('/catalogos/:id', CatalogoController.update);
router.delete('/catalogos/:id', CatalogoController.delete);

// API Lote C (Aprobación de Modificaciones - Soft Lock)
router.get('/solicitudes-edicion', AdminController.getSolicitudesEdicion);
router.post('/solicitudes-edicion/:id/aprobar', AdminController.aprobarSolicitudEdicion);
router.post('/solicitudes-edicion/:id/rechazar', AdminController.rechazarSolicitudEdicion);

// API Lote C (Exportación Maestra)
router.get('/master-backup', AdminController.generateMasterBackup);

module.exports = router;
