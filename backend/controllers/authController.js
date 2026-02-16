const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthController {
    static async login(req, res) {


        try {
            const { username, password } = req.body;

            // Validación básica
            if (!username || !password) {

                return res.status(400).json({
                    success: false,
                    message: 'Usuario y contraseña son requeridos'
                });
            }

            // Buscar usuario
            const user = await User.findByUsername(username);
            
            if (!user) {

                return res.status(401).json({
                    success: false,
                    message: 'Credenciales incorrectas'
                });
            }

            // Verificar contraseña
            const validPassword = await bcrypt.compare(password, user.password);
            
            if (!validPassword) {

                return res.status(401).json({
                    success: false,
                    message: 'Credenciales incorrectas'
                });
            }

            // Generar Token
            const token = jwt.sign(
                {
                    id: user.id,
                    username: user.username,
                    nombre_completo: user.nombre_completo,
                    turno: user.turno,
                    rol: user.rol
                },
                process.env.JWT_SECRET || 'secreto_super_seguro', // Fallback por si falta .env
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
            res.status(500).json({
                success: false,
                message: 'Error en el servidor'
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