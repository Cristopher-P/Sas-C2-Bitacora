const User = require('../models/User');
const Configuracion = require('../models/Configuracion');
const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const SystemLogger = require('../utils/logger');

class AdminController {
    
    // USERS
    static async getAllUsers(req, res) {
        try {
            const sql = 'SELECT id, username, nombre_completo, turno, rol, ip_permitida FROM usuarios';
            const [rows] = await pool.execute(sql);
            
            res.json({
                success: true,
                data: rows
            });
        } catch (error) {
            console.error('Error getting users:', error);
            res.status(500).json({ success: false, message: 'Error obteniendo usuarios' });
        }
    }

    static async updateUserName(req, res) {
        try {
            const { id } = req.params;
            const { username, nombre_completo, ip_permitida } = req.body;

            if (!nombre_completo || nombre_completo.trim() === '' || !username || username.trim() === '') {
                return res.status(400).json({ success: false, message: 'El login y nombre no pueden estar vacíos' });
            }

            const sql = 'UPDATE usuarios SET username = ?, nombre_completo = ?, ip_permitida = ? WHERE id = ?';
            const [result] = await pool.execute(sql, [username.trim(), nombre_completo.trim(), ip_permitida || null, id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
            }

            if (req.user) {
                await SystemLogger.log(req.user.id, 'actualizar_usuario', `Modificado username/nombre de ID: ${id}`);
            }

            res.json({ success: true, message: 'Usuario actualizado correctamente' });
        } catch (error) {
            console.error('Error updating user name:', error);
            res.status(500).json({ success: false, message: 'Error actualizando nombre de usuario' });
        }
    }

    static async updateUserPassword(req, res) {
        try {
            const { id } = req.params;
            const { new_password } = req.body;

            if (!new_password || new_password.trim() === '') {
                return res.status(400).json({ success: false, message: 'La nueva contraseña no puede estar vacía' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(new_password.trim(), salt);

            const sql = 'UPDATE usuarios SET password = ? WHERE id = ?';
            const [result] = await pool.execute(sql, [hashedPassword, id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
            }

            if (req.user) {
                await SystemLogger.log(req.user.id, 'cambiar_password', `Cambiado password de cuenta ID: ${id}`);
            }

            res.json({ success: true, message: 'Contraseña actualizada correctamente' });
        } catch (error) {
            console.error('Error updating user password:', error);
            res.status(500).json({ success: false, message: 'Error actualizando contraseña' });
        }
    }

    static async createUser(req, res) {
        try {
            const { username, password, nombre_completo, turno, rol } = req.body;

            if (!username || !password || !nombre_completo || !turno || !rol) {
                return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
            }

            // Check if user already exists
            const [existing] = await pool.execute('SELECT id FROM usuarios WHERE username = ?', [username.trim()]);
            if (existing.length > 0) {
                return res.status(400).json({ success: false, message: 'El nombre de usuario (login) ya está en uso' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password.trim(), salt);

            const sql = `
                INSERT INTO usuarios 
                (username, password, nombre_completo, turno, rol, ip_permitida) 
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            const values = [
                username.trim(),
                hashedPassword,
                nombre_completo.trim(),
                turno.trim(),
                rol.trim(),
                req.body.ip_permitida || null
            ];

            const [result] = await pool.execute(sql, values);

            res.status(201).json({ 
                success: true, 
                message: 'Usuario creado exitosamente',
                user: { id: result.insertId, username, nombre_completo, turno, rol }
            });

        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({ success: false, message: 'Error al crear el nuevo usuario' });
        }
    }

    // SETTINGS / RESET DIARIO / MANTENIMIENTO
    static async getSettings(req, res) {
        try {
            const resetDiarioActivo = await Configuracion.get('reset_diario_activo');
            const modoMantenimiento = await Configuracion.get('modo_mantenimiento');
            const edicionEstricta = await Configuracion.get('edicion_estricta');
            
            res.json({
                success: true,
                data: {
                    reset_diario_activo: resetDiarioActivo === 'true' || resetDiarioActivo === true,
                    modo_mantenimiento: modoMantenimiento === 'true' || modoMantenimiento === true,
                    edicion_estricta: edicionEstricta === 'true' || edicionEstricta === true
                }
            });
        } catch (error) {
            console.error('Error getting settings:', error);
            res.status(500).json({ success: false, message: 'Error obteniendo configuración' });
        }
    }

    static async updateSettings(req, res) {
        try {
            const { reset_diario_activo, modo_mantenimiento, edicion_estricta } = req.body;

            if (reset_diario_activo !== undefined) {
                await Configuracion.set('reset_diario_activo', reset_diario_activo ? 'true' : 'false');
            }

            if (edicion_estricta !== undefined) {
                const isStrict = edicion_estricta ? 'true' : 'false';
                await Configuracion.set('edicion_estricta', isStrict);
                if (req.user) {
                    await SystemLogger.log(req.user.id, 'configuracion', `Soft Lock cambiado a: ${isStrict}`);
                }
            }

            if (modo_mantenimiento !== undefined) {
                const isMaintenance = modo_mantenimiento ? 'true' : 'false';
                await Configuracion.set('modo_mantenimiento', isMaintenance);
                
                if (req.user) {
                    await SystemLogger.log(req.user.id, 'configuracion', `Modo mantenimiento cambiado a: ${isMaintenance}`);
                }

                if (modo_mantenimiento) {
                    const io = req.app.get('socketio');
                    if (io) {
                        io.emit('modo_mantenimiento_activo');
                    }
                }
            }

            res.json({ success: true, message: 'Configuración actualizada' });
        } catch (error) {
            console.error('Error updating settings:', error);
            res.status(500).json({ success: false, message: 'Error actualizando configuración' });
        }
    }

    // LOGS
    static async getSystemLogs(req, res) {
        try {
            const sql = `
                SELECT l.id, l.accion, l.detalles, l.fecha, u.nombre_completo as usuario
                FROM system_logs l
                LEFT JOIN usuarios u ON l.usuario_id = u.id
                ORDER BY l.fecha DESC LIMIT 500
            `;
            const [rows] = await pool.execute(sql);
            res.json({ success: true, data: rows });
        } catch (error) {
            console.error('Error getting logs:', error);
            res.status(500).json({ success: false, message: 'Error obteniendo logs' });
        }
    }

    // TRASH (Soft Deletes)
    static async getTrash(req, res) {
        try {
            const [tables] = await pool.execute("SHOW TABLES LIKE 'llamadas_bitacora_%'");
            let queries = [];
            
            for (const row of tables) {
                const tableName = Object.values(row)[0];
                queries.push(`
                    SELECT id, folio_sistema as folio, motivo, 'Llamada' as tipo, eliminado_en, eliminado_por, '${tableName}' as tabla 
                    FROM ${tableName} WHERE eliminado_en IS NOT NULL
                `);
            }
            
            queries.push(`
                SELECT id, folio_c4 as folio, motivo, 'Envío C5' as tipo, eliminado_en, eliminado_por, 'envios_c5' as tabla 
                FROM envios_c5 WHERE eliminado_en IS NOT NULL
            `);

            const finalQuery = queries.join(' UNION ALL ') + ' ORDER BY eliminado_en DESC LIMIT 200';
            const [rows] = await pool.execute(finalQuery);
            
            // Map eliminated_by ids to names
            const adminIds = [...new Set(rows.map(r => r.eliminado_por).filter(id => id != null))];
            const adminMap = {};
            if (adminIds.length > 0) {
                 const [admins] = await pool.execute(`SELECT id, nombre_completo FROM usuarios WHERE id IN (${adminIds.join(',')})`);
                 admins.forEach(a => adminMap[a.id] = a.nombre_completo);
            }
            
            rows.forEach(r => {
                r.eliminado_por_nombre = adminMap[r.eliminado_por] || 'Sistema/Desconocido';
            });

            res.json({ success: true, data: rows });
        } catch (error) {
            console.error('Error getting trash:', error);
            res.status(500).json({ success: false, message: 'Error obteniendo papelera' });
        }
    }
    
    static async restoreTrash(req, res) {
        try {
            const { tabla, id } = req.body;
            if (!tabla || !id) return res.status(400).json({ success: false, message: 'Faltan datos' });
            
            // Ensure table is safelisted to avoid SQL injection
            if (tabla !== 'envios_c5' && !tabla.startsWith('llamadas_bitacora_')) {
                return res.status(400).json({ success: false, message: 'Tabla no permitida' });
            }
            
            const sql = `UPDATE ${tabla} SET eliminado_en = NULL, eliminado_por = NULL WHERE id = ?`;
            await pool.execute(sql, [id]);
            
            if (req.user) {
                await SystemLogger.log(req.user.id, 'restaurar_papelera', `Restaurado ID: ${id} de ${tabla}`);
            }
            
            res.json({ success: true, message: 'Registro restaurado correctamente' });
        } catch (error) {
            console.error('Error restoring trash:', error);
            res.status(500).json({ success: false, message: 'Error restaurando registro' });
        }
    }

    // KARDEX (Estadísticas por Operador)
    static async getKardex(req, res) {
        try {
            // Get stats from last 30 days
            const today = new Date();
            const date30DaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
            
            // We need to query the current month table and maybe the previous month table for llamadas
            const [tables] = await pool.execute("SHOW TABLES LIKE 'llamadas_bitacora_%'");
            let queries = [];
            for (const row of tables) {
                const tableName = Object.values(row)[0];
                queries.push(`SELECT usuario_id, COUNT(*) as llamadas_count FROM ${tableName} WHERE fecha >= '${date30DaysAgo}' AND eliminado_en IS NULL GROUP BY usuario_id`);
            }
            
            const llamadasQuery = `SELECT usuario_id, SUM(llamadas_count) as total_llamadas FROM (${queries.join(' UNION ALL ')}) as sub GROUP BY usuario_id`;
            const [llamadasStats] = queries.length > 0 ? await pool.execute(llamadasQuery) : [[]];
            
            const enviosQuery = `SELECT usuario_id, COUNT(*) as total_envios FROM envios_c5 WHERE fecha_envio >= '${date30DaysAgo}' AND eliminado_en IS NULL GROUP BY usuario_id`;
            const [enviosStats] = await pool.execute(enviosQuery);
            
            const [users] = await pool.execute('SELECT id, nombre_completo, turno FROM usuarios');
            
            const stats = users.map(user => {
                const llamadas = llamadasStats.find(s => s.usuario_id === user.id)?.total_llamadas || 0;
                const envios = enviosStats.find(s => s.usuario_id === user.id)?.total_envios || 0;
                return {
                    id: user.id,
                    nombre_completo: user.nombre_completo,
                    turno: user.turno,
                    total_llamadas: llamadas,
                    total_envios: envios,
                    total_movimientos: parseInt(llamadas) + parseInt(envios)
                };
            }).sort((a,b) => b.total_movimientos - a.total_movimientos);
            
            res.json({ success: true, data: stats });
            
        } catch (error) {
            console.error('Error getting kardex:', error);
            res.status(500).json({ success: false, message: 'Error calculando estadísticas' });
        }
    }

    // === LOTE B: WEBSOCKETS (Tiempo Real) ===

    static async forceLogout(req, res) {
        try {
            const { userId } = req.body;
            if (!userId) return res.status(400).json({ success: false, message: 'ID de usuario requerido' });

            const io = req.app.get('socketio');
            if (io) {
                io.emit(`force_logout_${userId}`);
                
                if (req.user) {
                    await SystemLogger.log(req.user.id, 'forzar_cierre_sesion', `Se forzó cierre al usuario ID: ${userId}`);
                }
                
                res.json({ success: true, message: 'Comando de expulsión enviado' });
            } else {
                res.status(500).json({ success: false, message: 'Servicio WebSockets no disponible' });
            }
        } catch (error) {
            console.error('Error in forceLogout:', error);
            res.status(500).json({ success: false, message: 'Error al enviar comando' });
        }
    }

    static async broadcastMessage(req, res) {
        try {
            const { message, type = 'info' } = req.body;
            if (!message || message.trim() === '') {
                return res.status(400).json({ success: false, message: 'Mensaje requerido' });
            }

            const io = req.app.get('socketio');
            if (io) {
                io.emit('admin_broadcast', { message, type });
                
                if (req.user) {
                    await SystemLogger.log(req.user.id, 'mensaje_global', `Enviado: ${message.substring(0, 50)}...`);
                }
                
                res.json({ success: true, message: 'Mensaje global enviado' });
            } else {
                res.status(500).json({ success: false, message: 'Servicio WebSockets no disponible' });
            }
        } catch (error) {
            console.error('Error in broadcastMessage:', error);
            res.status(500).json({ success: false, message: 'Error al enviar mensaje global' });
        }
    }
    static async getSolicitudesEdicion(req, res) {
        try {
            const SolicitudEdicion = require('../models/SolicitudEdicion');
            const solicitudes = await SolicitudEdicion.getPendientes();
            res.json({ success: true, data: solicitudes });
        } catch (error) {
            console.error('Error in getSolicitudesEdicion:', error);
            res.status(500).json({ success: false, message: 'Error al obtener solicitudes' });
        }
    }

    static async aprobarSolicitudEdicion(req, res) {
        try {
            const { id } = req.params;
            const SolicitudEdicion = require('../models/SolicitudEdicion');
            const LlamadaBitacora = require('../models/LlamadaBitacora');
            
            const solicitud = await SolicitudEdicion.getById(id);
            if (!solicitud || solicitud.estado !== 'pendiente') {
                return res.status(404).json({ success: false, message: 'Solicitud no encontrada o no está pendiente' });
            }

            const datosNuevos = typeof solicitud.datos_nuevos === 'string' ? JSON.parse(solicitud.datos_nuevos) : solicitud.datos_nuevos;
            const tableName = datosNuevos.fecha ? LlamadaBitacora.getTableName(datosNuevos.fecha) : null;

            if (solicitud.modulo === 'llamadas_bitacora') {
                await LlamadaBitacora.update(solicitud.registro_id, tableName, datosNuevos);
            }
            
            await SolicitudEdicion.resolver(id, 'aprobada', req.user.id);
            await SystemLogger.log(req.user.id, 'aprobar_solicitud_edicion', `Aprobada solicitud ID: ${id} para llamada ${solicitud.registro_id}`);

            res.json({ success: true, message: 'Solicitud aprobada y registro actualizado' });
        } catch (error) {
            console.error('Error in aprobarSolicitudEdicion:', error);
            res.status(500).json({ success: false, message: 'Error al aprobar solicitud' });
        }
    }

    static async rechazarSolicitudEdicion(req, res) {
        try {
            const { id } = req.params;
            const SolicitudEdicion = require('../models/SolicitudEdicion');
            
            const solicitud = await SolicitudEdicion.getById(id);
            if (!solicitud || solicitud.estado !== 'pendiente') {
                return res.status(404).json({ success: false, message: 'Solicitud no encontrada o no está pendiente' });
            }
            
            await SolicitudEdicion.resolver(id, 'rechazada', req.user.id);
            await SystemLogger.log(req.user.id, 'rechazar_solicitud_edicion', `Rechazada solicitud ID: ${id} para llamada ${solicitud.registro_id}`);

            res.json({ success: true, message: 'Solicitud rechazada' });
        } catch (error) {
            console.error('Error in rechazarSolicitudEdicion:', error);
            res.status(500).json({ success: false, message: 'Error al rechazar solicitud' });
        }
    }
    static async generateMasterBackup(req, res) {
        try {
            const archiver = require('archiver');
            const { json2csv } = require('json-2-csv');

            // 1. Fetch all data
            const [usuarios] = await pool.execute('SELECT id, username, rol, nombre_completo, turno, ip_permitida, activo, credo_en FROM usuarios');
            
            const EnvioC5 = require('../models/EnvioC5');
            const reportesC5 = await EnvioC5.findAll({}); // All reports

            const [llamadas] = await pool.execute('SELECT * FROM llamadas_bitacora'); // From the view (consolidates all months)
            
            const [logs] = await pool.execute('SELECT l.id, u.nombre_completo as usuario, l.accion, l.detalles, l.fecha FROM system_logs l LEFT JOIN usuarios u ON l.usuario_id = u.id ORDER BY l.fecha DESC');

            // 2. Generate CSVs
            const csvUsuarios = json2csv(usuarios);
            const csvC5 = json2csv(reportesC5);
            const csvLlamadas = json2csv(llamadas);
            const csvLogs = json2csv(logs);

            // 3. Create ZIP and send to client
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `Respaldo_Maestro_C4_${timestamp}.zip`;

            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

            const archive = archiver('zip', {
                zlib: { level: 9 } // Maximum compression
            });

            archive.on('error', function(err) {
                throw err;
            });

            archive.pipe(res);

            archive.append(csvUsuarios, { name: 'usuarios.csv' });
            archive.append(csvC5, { name: 'envios_c5.csv' });
            archive.append(csvLlamadas, { name: 'llamadas.csv' });
            archive.append(csvLogs, { name: 'logs_auditoria.csv' });

            await archive.finalize();

            // Log activity
            await SystemLogger.log(req.user.id, 'descarga_respaldo_maestro', 'El administrador descargó un respaldo maestro completo (.zip)');

        } catch (error) {
            console.error('Error generando respaldo maestro:', error);
            if (!res.headersSent) {
                res.status(500).json({ success: false, message: 'Error generando el respaldo maestro' });
            }
        }
    }
}

module.exports = AdminController;
