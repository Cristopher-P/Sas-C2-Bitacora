const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

// Ruta de login
router.post('/login', AuthController.login);

// Ruta protegida para obtener perfil
router.get('/profile', AuthController.verifyToken, AuthController.getProfile);

module.exports = router;