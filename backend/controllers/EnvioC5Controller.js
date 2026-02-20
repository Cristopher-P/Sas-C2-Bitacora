const EnvioC5 = require('../models/EnvioC5');

class EnvioC5Controller {
    // Crear nuevo reporte C5
    static async crearReporte(req, res) {
        try {

            
            const { 
                fecha_envio, 
                hora_envio, 
                motivo, 
                ubicacion, 
                descripcion, 
                agente = '', 
                conclusion = '',
                metodo_envio = 'whatsapp',
                numero_destino = ''
            } = req.body;

            // Validación básica
            if (!fecha_envio || !hora_envio || !motivo || !ubicacion || !descripcion) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan campos requeridos: fecha, hora, motivo, ubicación y descripción'
                });
            }

            // Usar usuario autenticado o default
            const usuario_id = req.user?.id || 1; // Si tienes autenticación

            // Crear reporte usando el modelo
            const datosEnvio = {
                fecha_envio,
                hora_envio,
                motivo,
                ubicacion,
                descripcion,
                agente,
                conclusion,
                metodo_envio,
                numero_destino,
                usuario_id
            };



            const resultado = await EnvioC5.create(datosEnvio);
            
            // Emitir actualización vía WebSockets
            const io = req.app.get('socketio');
            if (io) {
                io.emit('reportes_actualizados', {
                    accion: 'nuevo_reporte',
                    folio_c4: resultado.folio_c4
                });
            }

            res.status(201).json({
                success: true,
                message: 'Reporte C5 creado y guardado en base de datos',
                data: {
                    id: resultado.id,
                    folio_c4: resultado.folio_c4,
                    fecha_envio,
                    hora_envio,
                    motivo,
                    ubicacion,
                    descripcion,
                    agente,
                    conclusion,
                    estado: 'pendiente'
                }
            });

        } catch (error) {
            console.error('🔥 Error creando reporte C5:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear reporte C5',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Obtener todos los reportes
    static async obtenerReportes(req, res) {
        try {

            
            const filtros = {};
            
            // Filtrar por estado si se proporciona
            if (req.query.estado) {
                filtros.estado = req.query.estado;
            }
            
            // Filtrar por fecha si se proporciona
            if (req.query.fecha) {
                filtros.fecha_desde = req.query.fecha;
                filtros.fecha_hasta = req.query.fecha;
            }

            // Obtener reportes de la base de datos
            const reportes = await EnvioC5.findAll(filtros);
            


            res.json({
                success: true,
                data: reportes,
                total: reportes.length
            });

        } catch (error) {
            console.error('🔥 Error obteniendo reportes:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener reportes'
            });
        }
    }

    // Registrar folio C5 (respuesta del C5)
    static async registrarFolioC5(req, res) {
        try {
            const { folio_c4, folio_c5 } = req.body;
            

            
            if (!folio_c4 || !folio_c5) {
                return res.status(400).json({
                    success: false,
                    message: 'Folio C4 y Folio C5 son requeridos'
                });
            }

            // Actualizar en la base de datos
            const resultado = await EnvioC5.registrarFolioC5(folio_c4, folio_c5);
            
            if (resultado > 0) {
                // Emitir actualización vía WebSockets
                const io = req.app.get('socketio');
                if (io) {
                    io.emit('reportes_actualizados', {
                        accion: 'folio_asignado_manual',
                        folio_c4,
                        folio_c5
                    });
                }

                res.json({
                    success: true,
                    message: 'Folio C5 registrado exitosamente',
                    data: { folio_c4, folio_c5 }
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'No se encontró el reporte con el folio C4 proporcionado'
                });
            }

        } catch (error) {
            console.error('🔥 Error registrando folio C5:', error);
            res.status(500).json({
                success: false,
                message: 'Error al registrar folio C5'
            });
        }
    }

    // Obtener reporte por folio C4
    static async obtenerReporte(req, res) {
        try {
            const { folioC4 } = req.params;
            
            const reporte = await EnvioC5.findByFolioC4(folioC4);
            
            if (!reporte) {
                return res.status(404).json({
                    success: false,
                    message: 'Reporte no encontrado'
                });
            }

            res.json({
                success: true,
                data: reporte
            });

        } catch (error) {
            console.error('🔥 Error obteniendo reporte:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener reporte'
            });
        }
    }

    // Obtener reportes pendientes
    static async obtenerPendientes(req, res) {
        try {
            const reportes = await EnvioC5.getPendientes();
            
            res.json({
                success: true,
                data: reportes,
                total: reportes.length
            });

        } catch (error) {
            console.error('🔥 Error obteniendo pendientes:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener reportes pendientes'
            });
        }
    }

    // Generar formato WhatsApp
    static async generarFormatoWhatsApp(req, res) {
        try {
            const { id } = req.params;
            
            const reporte = await EnvioC5.findById(id);
            
            if (!reporte) {
                return res.status(404).json({
                    success: false,
                    message: 'Reporte no encontrado'
                });
            }

            const formatoWhatsApp = EnvioC5.formatearParaWhatsApp(reporte);
            const enlaceWhatsApp = EnvioC5.generarEnlaceWhatsApp(formatoWhatsApp);

            res.json({
                success: true,
                data: {
                    formato: formatoWhatsApp,
                    enlace: enlaceWhatsApp,
                    reporte: reporte
                }
            });

        } catch (error) {
            console.error('🔥 Error generando formato WhatsApp:', error);
            res.status(500).json({
                success: false,
                message: 'Error al generar formato WhatsApp'
            });
        }
    }

    // Enviar reporte a C5 (Vía AWS SQS)
    static async enviarReporteC5(req, res) {
        try {
            const { id } = req.params;
            const AWSService = require('../services/AWSService'); // Importar servicio AWS
            
            // 1. Obtener datos del reporte
            const reporte = await EnvioC5.findById(id);
            
            if (!reporte) {
                return res.status(404).json({
                    success: false,
                    message: 'Reporte no encontrado'
                });
            }

            // 2. Preparar payload para C5
            const payload = {
                folio_c4: reporte.folio_c4,
                fecha: reporte.fecha_envio,
                hora: reporte.hora_envio,
                ubicacion: reporte.ubicacion,
                motivo: reporte.motivo,
                descripcion: reporte.descripcion,
                agente: reporte.agente,
                operador: req.user ? req.user.username : 'SISTEMA',
                meta: {
                    source: 'SAS-C4',
                    version: '1.0',
                    timestamp: new Date().toISOString()
                }
            };

            // 3. Enviar a C5 (SQS)
            console.log(`📤 Enviando reporte a cola SQS`);
            
            const resultado = await AWSService.enviarReporte(payload);
            
            // 4. Responder al cliente
            res.json({
                success: true,
                message: 'Reporte encolado exitosamente para envío a C5',
                data: {
                    sqsMessageId: resultado.messageId
                }
            });

        } catch (error) {
            console.error('🔥 Error enviando a C5 (SQS):', error.message);
            res.status(500).json({
                success: false,
                message: `Error al encolar reporte: ${error.message}`
            });
        }
    }
}

module.exports = EnvioC5Controller;