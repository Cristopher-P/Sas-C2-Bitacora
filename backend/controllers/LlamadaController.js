const LlamadaBitacora = require('../models/LlamadaBitacora');
const { validationResult } = require('express-validator');

class LlamadaController {
    // Registrar nueva llamada
    static async registrarLlamada(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ 
                    success: false, 
                    errors: errors.array() 
                });
            }

            // Desestructurar todos los posibles campos del frontend
            const {
                fecha,
                turno,
                hora,
                motivo,
                ubicacion,
                colonia,
                seguimiento,
                razonamiento,
                descripcion,  // 
                motivo_radio_operacion,
                salida,
                detenido,
                vehiculo,
                numero_telefono,
                telefono,      // 
                peticionario,
                agente,
                telefono_agente
            } = req.body;

            //  CORRECTO: Crear objeto con valores por defecto
            const datosLlamada = {
                fecha: fecha || new Date().toISOString().split('T')[0],
                turno: turno || (req.user ? req.user.turno : 'matutino'),
                hora: hora || new Date().toTimeString().substring(0,5),
                motivo: motivo || '',
                ubicacion: ubicacion || '',
                colonia: colonia || '',
                seguimiento: seguimiento || 'Sin seguimiento',
                razonamiento: razonamiento || descripcion || '',  // Aceptar ambos
                motivo_radio_operacion: motivo_radio_operacion || 'Llamada telefónica',
                salida: salida || 'no',
                detenido: detenido || 'no',
                vehiculo: vehiculo || '',
                numero_telefono: numero_telefono || telefono || '',  // Aceptar ambos
                peticionario: peticionario || 'Anónimo',
                agente: agente || '',
                telefono_agente: telefono_agente || '',
                usuario_id: req.user ? req.user.id : 1
            };

            // ¡ESTA LÍNEA FALTABA! Crear en la base de datos
            const llamadaId = await LlamadaBitacora.create(datosLlamada);

            // Obtener la llamada recién creada con su folio
            const llamada = await LlamadaBitacora.findById(llamadaId);

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
                error: error.message  // Agregar mensaje detallado
            });
        }
    }

    // Obtener llamadas con filtros
    static async obtenerLlamadas(req, res) {
        try {
            const {
                fecha,
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
                limit
            } = req.query;

            let filtros = {};

            if (fecha) filtros.fecha = fecha;
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
            
            if (fecha_inicio && fecha_fin) {
                llamadas = await LlamadaBitacora.findByDateRange(fecha_inicio, fecha_fin);
            } else {
                llamadas = await LlamadaBitacora.findAll(filtros);
            }

            res.json({
                success: true,
                data: llamadas,
                total: llamadas.length
            });
        } catch (error) {
            console.error('Error obteniendo llamadas:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener llamadas'
            });
        }
    }

    // Obtener una llamada específica
    static async obtenerLlamada(req, res) {
        try {
            const { id } = req.params;
            
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de llamada es requerido'
                });
            }

            const llamada = await LlamadaBitacora.findById(id);

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

    // Actualizar llamada
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

            const actualizado = await LlamadaBitacora.update(id, datos);

            if (actualizado === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Llamada no encontrada o sin cambios'
                });
            }

            const llamadaActualizada = await LlamadaBitacora.findById(id);

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

    // Eliminar llamada
    static async eliminarLlamada(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de llamada es requerido'
                });
            }

            const eliminado = await LlamadaBitacora.delete(id);

            if (eliminado === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Llamada no encontrada'
                });
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

    // Obtener estadísticas
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

    // Obtener datos para autocompletar
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

    // Exportar llamadas a formato específico
    static async exportarLlamadas(req, res) {
        try {
            const { fecha_inicio, fecha_fin } = req.query;

            const fechaInicio = fecha_inicio || new Date().toISOString().split('T')[0];
            const fechaFin = fecha_fin || new Date().toISOString().split('T')[0];

            const llamadas = await LlamadaBitacora.findByDateRange(fechaInicio, fechaFin);

            // Formatear para exportación
            const datosExportar = llamadas.map(llamada => ({
                'FOLIO SISTEMA': llamada.folio_sistema,
                'FECHA': llamada.fecha,
                'TURNO': llamada.turno,
                'HORA': llamada.hora,
                'MOTIVO': llamada.motivo,
                'UBICACIÓN': llamada.ubicacion,
                'COLONIA': llamada.colonia,
                'SEGUIMIENTO': llamada.seguimiento,
                'RAZONAMIENTO': llamada.razonamiento,
                'MOTIVO RADIO OPERACIÓN': llamada.motivo_radio_operacion,
                'SALIDA': llamada.salida,
                'DETENIDO': llamada.detenido,
                'VEHÍCULO': llamada.vehiculo,
                'NÚMERO TELÉFONO': llamada.numero_telefono,
                'PETICIONARIO': llamada.peticionario,
                'AGENTE': llamada.agente,
                'TELÉFONO AGENTE': llamada.telefono_agente,
                'SUPERVISOR': llamada.supervisor,
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