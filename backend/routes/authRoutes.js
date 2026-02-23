const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const rateLimit = require('express-rate-limit');

// Configuración del límite de intentos (Fuerza Bruta)
const loginLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 5, // Limita cada IP a 5 peticiones por ventana
    message: {
        success: false,
        message: 'Demasiados intentos de inicio de sesión. Por favor, intente de nuevo en 5 minutos.'
    },
    standardHeaders: true, // Retorna rate limit info en los headers `RateLimit-*`
    legacyHeaders: false, // Deshabilita los headers `X-RateLimit-*`
});

// Ruta de login
router.post('/login', loginLimiter, AuthController.login);

// Ruta protegida para obtener perfil
router.get('/profile', AuthController.verifyToken, AuthController.getProfile);

module.exports = router;