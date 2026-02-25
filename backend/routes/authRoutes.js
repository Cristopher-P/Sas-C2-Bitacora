const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: 'Demasiados intentos de inicio de sesión. Por favor, intente de nuevo en 5 minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/login', loginLimiter, AuthController.login);

router.get('/profile', AuthController.verifyToken, AuthController.getProfile);

module.exports = router;