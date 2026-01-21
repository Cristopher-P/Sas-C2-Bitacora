const EnvioC5 = require('../models/EnvioC5');

class EnvioC5Controller {
    // Crear nuevo reporte C5
    static async crearReporte(req, res) {
        try {
            console.log('📝 Creando nuevo reporte C5:', req.body);
            
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

            console.log('📦 Datos para guardar:', datosEnvio);

            const resultado = await EnvioC5.create(datosEnvio);
            
            console.log('✅ Reporte guardado en MySQL:', resultado.folio_c4);

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
            console.log('📋 Obteniendo reportes C5');
            
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
            
            console.log(`✅ Encontrados ${reportes.length} reportes`);

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
            
            console.log(`📝 Registrando folio C5: ${folio_c5} para C4: ${folio_c4}`);
            
            if (!folio_c4 || !folio_c5) {
                return res.status(400).json({
                    success: false,
                    message: 'Folio C4 y Folio C5 son requeridos'
                });
            }

            // Actualizar en la base de datos
            const resultado = await EnvioC5.registrarFolioC5(folio_c4, folio_c5);
            
            if (resultado > 0) {
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
}

module.exports = EnvioC5Controller;