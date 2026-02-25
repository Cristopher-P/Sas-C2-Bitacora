const { body, validationResult } = require('express-validator');

exports.validarCreacion = [
    body('fecha_envio').notEmpty().withMessage('La fecha de envío es obligatoria'),
    body('hora_envio').notEmpty().withMessage('La hora de envío es obligatoria'),
    body('motivo').notEmpty().withMessage('El motivo es obligatorio').isString(),
    body('ubicacion').notEmpty().withMessage('La ubicación es obligatoria').isString(),
    body('descripcion').notEmpty().withMessage('La descripción es obligatoria').isString(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos o hay errores de validación',
                errors: errors.array()
            });
        }
        next();
    }
];
