const https = require('https');
const LlamadaBitacora = require('../models/LlamadaBitacora');
const Configuracion = require('../models/Configuracion');
const SystemLogger = require('../utils/logger');
const { validationResult } = require('express-validator');

class LlamadaController {
    static async geocodificarDireccion(req, res) {
        try {
            const address = req.query.address || req.query.q;
            if (!address) {
                return res.status(400).json({
                    success: false,
                    message: 'address es requerido'
                });
            }

            const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&countrycodes=mx&q=${encodeURIComponent(address)}`;
            const options = {
                headers: {
                    'User-Agent': 'SAS-C4-Bitacora/1.0 (local)',
                    'Accept-Language': 'es'
                }
            };

            https.get(url, options, (resp) => {
                let data = '';
                resp.on('data', (chunk) => {
                    data += chunk;
                });
                resp.on('end', () => {
                    if (resp.statusCode !== 200) {
                        return res.status(502).json({
                            success: false,
                            message: 'Error en geocodificación'
                        });
                    }
                    try {
                        const resultados = JSON.parse(data);
                        if (!Array.isArray(resultados) || resultados.length === 0) {
                            return res.json({ success: false });
                        }
                        const lat = parseFloat(resultados[0].lat);
                        const lng = parseFloat(resultados[0].lon);
                        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
                            return res.json({ success: false });
                        }
                        return res.json({ success: true, lat, lng, provider: 'nominatim' });
                    } catch (error) {
                        return res.status(500).json({
                            success: false,
                            message: 'Respuesta inválida de geocodificación'
                        });
                    }
                });
            }).on('error', () => {
                res.status(500).json({
                    success: false,
                    message: 'Error consultando geocodificación'
                });
            });
        } catch (error) {
            console.error('Error geocodificando:', error);
            res.status(500).json({
                success: false,
                message: 'Error al geocodificar'
            });
        }
    }

    static async registrarLlamada(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const {
                fecha,
                turno,
                turn,
                hora,
                hr_rec,
                motivo,
                ubicacion,
                colonia,
                ecto,
                unidad,
                de_desi,
                reporti,
                llega,
                salida_hora,
                salida_h,
                seguimiento,
                razonamiento,
                descripcion,
                motivo_radio_operacion,
                motivo_radio,
                salida,
                detenido,
                det,
                vehiculo,
                veh,
                numero_telefono,
                telefono,
                numero_tel,
                peticionario,
                agente,
                agente_tel,
                telefono_agente,
                folio_sistema,
                folio
            } = req.body;

            const datosLlamada = {
                folio_sistema: folio_sistema || folio || null,
                fecha: fecha || new Date().toISOString().split('T')[0],
                turno: turno || turn || (req.user ? req.user.turno : 'matutino'),
                hora: hora || hr_rec || new Date().toTimeString().substring(0, 5),
                motivo: motivo || '',
                ubicacion: ubicacion || '',
                colonia: colonia || '',
                ecto: ecto || '',
                unidad: unidad || '',
                de_desi: de_desi || '',
                reporti: reporti || null,
                llega: llega || null,
                salida_hora: salida_hora || salida_h || null,
                seguimiento: seguimiento || 'Sin seguimiento',
                razonamiento: razonamiento || descripcion || '',
                descripcion_detallada: descripcion || razonamiento || '',
                motivo_radio_operacion: motivo_radio_operacion || motivo_radio || 'Llamada telefónica',
                salida: salida || 'no',
                detenido: detenido || det || 'no',
                vehiculo: vehiculo || veh || '',
                numero_telefono: numero_telefono || telefono || numero_tel || '',
                peticionario: peticionario || 'Anónimo',
                agente: agente || agente_tel || '',
                telefono_agente: telefono_agente || '',
                folio_c5: '',
                conclusion: '',
                usuario_id: req.user ? req.user.id : 1
            };

            const llamadaId = await LlamadaBitacora.create(datosLlamada);
            const llamada = await LlamadaBitacora.findById(llamadaId.insertId || llamadaId);

            if (req.user) {
                await SystemLogger.log(req.user.id, 'registrar_llamada', `Nuevo registro ID: ${llamadaId.insertId || llamadaId}, Folio: ${llamada ? llamada.folio_sistema : ''}`);
            }

            res.status(201).json({
                success: true,
                message: 'Llamada registrada exitosamente',
                data: llamada
            });
        } catch (error) {
            console.error('Error registrando llamada:', error);
            res.status(500).json({
                success: false,
                message: 'Error al registrar la llamada',
                error: error.message,
                code: error.code || null
            });
        }
    }

    static async obtenerLlamadas(req, res) {
        try {
            const {
                fecha,
                mes,
                turno,
                motivo,
                ubicacion,
                colonia,
                peticionario,
                agente,
                folio,
                salida,
                detenido,
                fecha_inicio,
                fecha_fin,
                limit,
                busqueda
            } = req.query;

            let filtros = {};

            if (busqueda) filtros.busqueda = busqueda;
            
            // Check Daily Reset Configuration if no explicit date/month is provided
            if (!fecha && !mes && !busqueda && !fecha_inicio && !fecha_fin) {
                const resetDiarioActivo = await Configuracion.get('reset_diario_activo');
                if (resetDiarioActivo === 'true' || resetDiarioActivo === true) {
                    const hoy = new Date();
                    // Local machine time formatting might be needed to assure correct time zone
                    // For now, mapping directly to iso string for 'fecha' field. Let's use standard local yyyy-mm-dd
                    const offset = hoy.getTimezoneOffset() * 60000;
                    const localISOTime = (new Date(hoy - offset)).toISOString().split('T')[0];
                    filtros.fecha = localISOTime;
                } else {
                    const hoy = new Date();
                    const currentMes = String(hoy.getMonth() + 1).padStart(2, '0');
                    const año = hoy.getFullYear();
                    filtros.mes_objetivo = `${año}-${currentMes}-01`;
                }
            } else {
                if (fecha) filtros.fecha = fecha;
                if (mes) filtros.mes_objetivo = mes + '-01';
            }
            
            if (turno) filtros.turno = turno;
            if (motivo) filtros.motivo = motivo;
            if (ubicacion) filtros.ubicacion = ubicacion;
            if (colonia) filtros.colonia = colonia;
            if (peticionario) filtros.peticionario = peticionario;
            if (agente) filtros.agente = agente;
            if (folio) filtros.folio = folio;
            if (salida) filtros.salida = salida;
            if (detenido) filtros.detenido = detenido;
            if (limit) filtros.limit = limit;

            let llamadas;
            let totalDb = null;

            if (fecha_inicio && fecha_fin) {
                llamadas = await LlamadaBitacora.findByDateRange(fecha_inicio, fecha_fin);
            } else {
                llamadas = await LlamadaBitacora.findAllRaw(filtros);
                totalDb = await LlamadaBitacora.countAllRaw(filtros);
            }

            res.json({
                success: true,
                data: llamadas,
                total: llamadas.length,
                total_db: totalDb
            });
        } catch (error) {
            console.error('Error obteniendo llamadas:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener llamadas'
            });
        }
    }

    static async obtenerLlamada(req, res) {
        try {
            const { id } = req.params;
            const { mes } = req.query;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de llamada es requerido'
                });
            }

            let targetTableName = mes ? LlamadaBitacora.getTableName(mes + '-01') : null;
            const llamada = await LlamadaBitacora.findById(id, targetTableName);

            if (!llamada) {
                return res.status(404).json({
                    success: false,
                    message: 'Llamada no encontrada'
                });
            }

            res.json({
                success: true,
                data: llamada
            });
        } catch (error) {
            console.error('Error obteniendo llamada:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener la llamada'
            });
        }
    }

    static async actualizarLlamada(req, res) {
        try {
            const { id } = req.params;
            const datos = req.body;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de llamada es requerido'
                });
            }

            const Configuracion = require('../models/Configuracion');
            const edicionEstrictaStr = await Configuracion.get('edicion_estricta');
            const edicionEstricta = edicionEstrictaStr === 'true' || edicionEstrictaStr === true;

            if (edicionEstricta && req.user && req.user.rol !== 'admin') {
                const SolicitudEdicion = require('../models/SolicitudEdicion');
                await SolicitudEdicion.create('llamadas_bitacora', id, req.user.id, datos);
                
                const SystemLogger = require('../models/SystemLogger');
                await SystemLogger.log(req.user.id, 'solicitud_edicion_llamada', `Llamada ID: ${id}`);

                return res.json({
                    success: true,
                    message: 'Modificación enviada a revisión. Pendiente de aprobación.',
                    data: null,
                    isPendingReview: true
                });
            }

            const tableName = datos.fecha ? LlamadaBitacora.getTableName(datos.fecha) : null;

            const actualizado = await LlamadaBitacora.update(id, tableName, datos);

            if (actualizado === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Llamada no encontrada o sin cambios'
                });
            }

            const llamadaActualizada = await LlamadaBitacora.findById(id, tableName);

            if (req.user) {
                await SystemLogger.log(req.user.id, 'actualizar_llamada', `Llamada ID: ${id}`);
            }

            res.json({
                success: true,
                message: 'Llamada actualizada exitosamente',
                data: llamadaActualizada
            });
        } catch (error) {
            console.error('Error actualizando llamada:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar la llamada'
            });
        }
    }

    static async eliminarLlamada(req, res) {
        try {
            const { id } = req.params;
            const { fecha } = req.query;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de llamada es requerido'
                });
            }

            const tableName = fecha ? LlamadaBitacora.getTableName(fecha) : null;
            const usuario_id = req.user ? req.user.id : null;
            const eliminado = await LlamadaBitacora.delete(id, tableName, usuario_id);

            if (eliminado === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Llamada no encontrada en el sistema actual'
                });
            }

            if (req.user) {
                await SystemLogger.log(req.user.id, 'eliminar_llamada', `Llamada (borrado lógico) ID: ${id}`);
            }

            res.json({
                success: true,
                message: 'Llamada eliminada exitosamente'
            });
        } catch (error) {
            console.error('Error eliminando llamada:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar la llamada'
            });
        }
    }

    static async obtenerEstadisticas(req, res) {
        try {
            const { fecha_inicio, fecha_fin } = req.query;

            const fechaInicio = fecha_inicio || new Date().toISOString().split('T')[0];
            const fechaFin = fecha_fin || new Date().toISOString().split('T')[0];

            const estadisticas = await LlamadaBitacora.getEstadisticas(fechaInicio, fechaFin);
            const totalPorTurno = await LlamadaBitacora.getTotalPorTurno(new Date().toISOString().split('T')[0]);

            res.json({
                success: true,
                estadisticas,
                totalPorTurno,
                periodo: { fecha_inicio: fechaInicio, fecha_fin: fechaFin }
            });
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas'
            });
        }
    }

    static async obtenerAutocompletar(req, res) {
        try {
            const datos = await LlamadaBitacora.getDatosAutocompletar();

            res.json({
                success: true,
                ...datos
            });
        } catch (error) {
            console.error('Error obteniendo datos:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener datos'
            });
        }
    }

    static async exportarLlamadas(req, res) {
        try {
            const { fecha_inicio, fecha_fin } = req.query;

            const fechaInicio = fecha_inicio || new Date().toISOString().split('T')[0];
            const fechaFin = fecha_fin || new Date().toISOString().split('T')[0];

            const llamadas = await LlamadaBitacora.findByDateRange(fechaInicio, fechaFin);

            const datosExportar = llamadas.map(llamada => ({
                'FOLIO SISTEMA': llamada.folio_sistema,
                'FECHA': llamada.fecha,
                'TURNO': llamada.turno,
                'HORA': llamada.hora,
                'MOTIVO': llamada.motivo,
                'UBICACIÓN': llamada.ubicacion,
                'COLONIA': llamada.colonia,
                'SECTOR': llamada.ecto,
                'UNIDAD': llamada.unidad,
                'DESTINO': llamada.de_desi,
                'HORA REPORTE': llamada.reporti,
                'HORA LLEGADA': llamada.llega,
                'HORA SALIDA': llamada.salida_hora,
                'SEGUIMIENTO': llamada.seguimiento,
                'RAZONAMIENTO': llamada.razonamiento,
                'DESCRIPCIÓN DETALLADA': llamada.descripcion_detallada,
                'MOTIVO RADIO OPERACIÓN': llamada.motivo_radio_operacion,
                'SALIDA': llamada.salida,
                'DETENIDO': llamada.detenido,
                'VEHÍCULO': llamada.vehiculo,
                'NÚMERO TELÉFONO': llamada.numero_telefono,
                'PETICIONARIO': llamada.peticionario,
                'AGENTE': llamada.agente,
                'TELÉFONO AGENTE': llamada.telefono_agente,
                'FOLIO C5': llamada.folio_c5,
                'CONCLUSIÓN': llamada.conclusion,
                'HORA REGISTRO': llamada.hora_registro
            }));

            res.json({
                success: true,
                datos: datosExportar,
                total: datosExportar.length,
                periodo: { fecha_inicio: fechaInicio, fecha_fin: fechaFin }
            });
        } catch (error) {
            console.error('Error exportando:', error);
            res.status(500).json({
                success: false,
                message: 'Error al exportar datos'
            });
        }
    }
}

module.exports = LlamadaController;