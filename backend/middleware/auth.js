const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Acceso no autorizado'
        });
    }

    try {
        // Usar un fallback idéntico al de authController en dev, pero prohibido en producción
        if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
            console.error('CRITICAL: JWT_SECRET no está definido en el entorno de producción.');
            return res.status(500).json({ success: false, message: 'Configuración de servidor incompleta (JWT_SECRET)' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_super_seguro');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token inválido'
        });
    }
};

module.exports = authMiddleware;