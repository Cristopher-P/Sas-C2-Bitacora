const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Configuracion = require('../models/Configuracion');
const SystemLogger = require('../utils/logger');

const SERVER_START_TIME = Date.now();

class AuthController {
    static async login(req, res) {

        try {
            const { username, password } = req.body;

            if (!username || !password) {

                return res.status(400).json({
                    success: false,
                    message: 'Usuario y contraseña son requeridos'
                });
            }

            const user = await User.findByUsername(username);

            if (!user) {

                return res.status(401).json({
                    success: false,
                    message: 'Credenciales incorrectas'
                });
            }

            const validPassword = await bcrypt.compare(password, user.password);

            if (!validPassword) {

                return res.status(401).json({
                    success: false,
                    message: 'Credenciales incorrectas'
                });
            }

            // Mantenimiento check
            const modoMantenimiento = await Configuracion.get('modo_mantenimiento');
            if (modoMantenimiento === 'true' && user.rol !== 'admin') {
                await SystemLogger.log(user.id, 'bloqueo_mantenimiento', `Intento de acceso denegado por modo mantenimiento.`);
                return res.status(503).json({
                    success: false,
                    message: 'El sistema se encuentra temporalmente en mantenimiento. Por favor, intente más tarde.'
                });
            }

            // IP check
            const currentIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
            if (user.ip_permitida && user.ip_permitida.trim() !== '') {
                const allowedIps = user.ip_permitida.split(',').map(ip => ip.trim());
                // Handle IPv4 mapped IPv6 addresses if testing locally (e.g., ::1 or ::ffff:127.0.0.1)
                const isIpAllowed = allowedIps.some(allowedIp => currentIp.includes(allowedIp));

                if (!isIpAllowed) {
                    console.log(`Bloqueo IP: Usuario ${user.username} intentó acceder desde ${currentIp} (Permitidas: ${user.ip_permitida})`);
                    await SystemLogger.log(user.id, 'bloqueo_ip', `Intento de acceso denegado desde IP: ${currentIp}`);
                    return res.status(403).json({
                        success: false,
                        message: 'Acceso denegado. Computadora o Red no autorizada.'
                    });
                }
            }

            await SystemLogger.log(user.id, 'inicio_sesion', `Acceso concedido desde IP: ${currentIp}`);

            const token = jwt.sign(
                {
                    id: user.id,
                    username: user.username,
                    nombre_completo: user.nombre_completo,
                    turno: user.turno,
                    rol: user.rol
                },
                process.env.JWT_SECRET || 'secreto_super_seguro',
                { expiresIn: '8h' }
            );

            res.json({
                success: true,
                message: 'Login exitoso',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    nombre_completo: user.nombre_completo,
                    turno: user.turno,
                    rol: user.rol
                }
            });
        } catch (error) {
            console.error('🔥 Error CRÍTICO en login:', error);

            try {
                const config = require('../config/app.config');
                const mockUser = config.MOCK_USERS.find(u => u.username === req.body.username);

                if (mockUser && mockUser.password === req.body.password) {
                    console.log('⚠️ Usando usuario MOCK por fallo en BD');

                    const token = jwt.sign(
                        {
                            id: 999,
                            username: mockUser.username,
                            nombre_completo: mockUser.username.toUpperCase(),
                            turno: mockUser.turno,
                            rol: mockUser.rol
                        },
                        process.env.JWT_SECRET || 'secreto_super_seguro',
                        { expiresIn: '8h' }
                    );

                    return res.json({
                        success: true,
                        message: 'Login exitoso (Modo Respaldo)',
                        token,
                        user: {
                            id: 999,
                            username: mockUser.username,
                            nombre_completo: mockUser.username.toUpperCase(),
                            turno: mockUser.turno,
                            rol: mockUser.rol
                        }
                    });
                }
            } catch (fallbackError) {
                console.error('Fallo en fallback:', fallbackError);
            }

            res.status(500).json({
                success: false,
                message: 'Error en el servidor y falló el acceso de respaldo'
            });
        }
    }

    static verifyToken(req, res, next) {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader) {
                return res.status(401).json({
                    success: false,
                    message: 'Token no proporcionado'
                });
            }

            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_super_seguro');

            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Token inválido o expirado'
            });
        }
    }

    static async getProfile(req, res) {
        try {
            const user = await User.findById(req.user.id);

            res.json({
                success: true,
                user
            });
        } catch (error) {
            console.error('Error obteniendo perfil:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor'
            });
        }
    }
}

module.exports = AuthController;