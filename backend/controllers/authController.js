// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

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

            console.log(`🔍 Buscando usuario: ${username}`);
            const user = await User.findByUsername(username);
            
            if (!user) {

                return res.status(401).json({
                    success: false,
                    message: 'Credenciales incorrectas'
                });
            }

            console.log(`✅ Usuario encontrado: ${user.username}`);
            
            // VERIFICACIÓN INTELIGENTE DE CONTRASEÑA
            let validPassword = false;
            
            if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
                // Es un hash bcrypt
                console.log("🔐 Verificando con bcrypt...");
                validPassword = await bcrypt.compare(password, user.password);
            } else {
                // Es texto plano (convertir y actualizar)
                console.log("🔄 Contraseña en texto plano, convirtiendo...");
                validPassword = (password === user.password);
                
                if (validPassword) {
                    console.log("⚠️  ¡IMPORTANTE! Contraseña en texto plano");
                    console.log("   Se recomienda ejecutar el script de hash");
                }
            }
            
            if (!validPassword) {

                return res.status(401).json({
                    success: false,
                    message: 'Credenciales incorrectas'
                });
            }

            console.log("✅ Login exitoso");

            // Generar Token
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
            console.error('🔥 Error en login:', error);
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