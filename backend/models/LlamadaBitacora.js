const pool = require('../config/database');

class LlamadaBitacora {
    // Crear nueva llamada
    static async create(llamadaData) {
        const sql = `
            INSERT INTO llamadas_bitacora 
            (fecha, turno, hora, motivo, ubicacion, colonia,
             seguimiento, razonamiento, motivo_radio_operacion,
             salida, detenido, vehiculo, numero_telefono,
             peticionario, agente, telefono_agente, usuario_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await pool.execute(sql, [
            llamadaData.fecha,
            llamadaData.turno,
            llamadaData.hora,
            llamadaData.motivo,
            llamadaData.ubicacion,
            llamadaData.colonia,
            llamadaData.seguimiento,
            llamadaData.razonamiento,
            llamadaData.motivo_radio_operacion,
            llamadaData.salida,
            llamadaData.detenido,
            llamadaData.vehiculo,
            llamadaData.numero_telefono,
            llamadaData.peticionario,
            llamadaData.agente,
            llamadaData.telefono_agente,
            llamadaData.usuario_id
        ]);
        
        return result.insertId;
    }

    // Obtener llamada por ID
    static async findById(id) {
        const sql = `
            SELECT lb.*, u.nombre_completo as supervisor
            FROM llamadas_bitacora lb
            JOIN usuarios u ON lb.usuario_id = u.id
            WHERE lb.id = ?
        `;
        
        const [rows] = await pool.execute(sql, [id]);
        return rows[0];
    }

    // Obtener todas las llamadas con filtros
    static async findAll(filtros = {}) {
        let sql = `
            SELECT 
                lb.id,
                lb.folio_sistema,
                lb.fecha,
                lb.turno,
                lb.hora,
                lb.motivo,
                lb.ubicacion,
                lb.colonia,
                lb.peticionario,
                lb.agente,
                lb.salida,
                lb.detenido,
                lb.vehiculo,
                u.nombre_completo as supervisor,
                lb.hora_registro
            FROM llamadas_bitacora lb
            JOIN usuarios u ON lb.usuario_id = u.id
            WHERE 1=1
        `;
        
        const params = [];

        // Aplicar filtros
        if (filtros.fecha) {
            sql += ' AND lb.fecha = ?';
            params.push(filtros.fecha);
        }

        if (filtros.turno) {
            sql += ' AND lb.turno = ?';
            params.push(filtros.turno);
        }

        if (filtros.motivo) {
            sql += ' AND lb.motivo LIKE ?';
            params.push(`%${filtros.motivo}%`);
        }

        if (filtros.ubicacion) {
            sql += ' AND lb.ubicacion LIKE ?';
            params.push(`%${filtros.ubicacion}%`);
        }

        if (filtros.colonia) {
            sql += ' AND lb.colonia LIKE ?';
            params.push(`%${filtros.colonia}%`);
        }

        if (filtros.peticionario) {
            sql += ' AND lb.peticionario LIKE ?';
            params.push(`%${filtros.peticionario}%`);
        }

        if (filtros.agente) {
            sql += ' AND lb.agente LIKE ?';
            params.push(`%${filtros.agente}%`);
        }

        if (filtros.folio) {
            sql += ' AND lb.folio_sistema LIKE ?';
            params.push(`%${filtros.folio}%`);
        }

        if (filtros.salida) {
            sql += ' AND lb.salida = ?';
            params.push(filtros.salida);
        }

        if (filtros.detenido) {
            sql += ' AND lb.detenido = ?';
            params.push(filtros.detenido);
        }

        // Ordenar por fecha y hora descendente
        sql += ' ORDER BY lb.fecha DESC, lb.hora DESC';

        // Limitar resultados si se especifica
        if (filtros.limit) {
            sql += ' LIMIT ?';
            params.push(parseInt(filtros.limit));
        }

        const [rows] = await pool.execute(sql, params);
        return rows;
    }

    // Obtener llamadas por rango de fechas
    static async findByDateRange(fechaInicio, fechaFin) {
        const sql = `
            SELECT 
                lb.*,
                u.nombre_completo as supervisor
            FROM llamadas_bitacora lb
            JOIN usuarios u ON lb.usuario_id = u.id
            WHERE lb.fecha BETWEEN ? AND ?
            ORDER BY lb.fecha DESC, lb.hora DESC
        `;
        
        const [rows] = await pool.execute(sql, [fechaInicio, fechaFin]);
        return rows;
    }

    // Actualizar llamada
    static async update(id, datosActualizados) {
        const campos = [];
        const valores = [];
        
        // Construir SET dinámicamente
        Object.keys(datosActualizados).forEach(campo => {
            if (campo !== 'id' && campo !== 'folio_sistema') {
                campos.push(`${campo} = ?`);
                valores.push(datosActualizados[campo]);
            }
        });
        
        if (campos.length === 0) {
            return 0;
        }
        
        const sql = `UPDATE llamadas_bitacora SET ${campos.join(', ')} WHERE id = ?`;
        valores.push(id);
        
        const [result] = await pool.execute(sql, valores);
        return result.affectedRows;
    }

    // Eliminar llamada
    static async delete(id) {
        const sql = 'DELETE FROM llamadas_bitacora WHERE id = ?';
        const [result] = await pool.execute(sql, [id]);
        return result.affectedRows;
    }

    // Obtener estadísticas
    static async getEstadisticas(fechaInicio, fechaFin) {
        const sql = `
            SELECT 
                fecha,
                COUNT(*) as total_llamadas,
                SUM(CASE WHEN salida = 'si' THEN 1 ELSE 0 END) as salidas,
                SUM(CASE WHEN detenido = 'si' THEN 1 ELSE 0 END) as detenidos,
                COUNT(DISTINCT motivo) as motivos_distintos,
                COUNT(DISTINCT ubicacion) as ubicaciones_distintas
            FROM llamadas_bitacora
            WHERE fecha BETWEEN ? AND ?
            GROUP BY fecha
            ORDER BY fecha DESC
        `;
        
        const [rows] = await pool.execute(sql, [fechaInicio, fechaFin]);
        return rows;
    }

    // Obtener datos para autocompletar
    static async getDatosAutocompletar() {
        const queries = [
            'SELECT DISTINCT motivo FROM llamadas_bitacora WHERE motivo IS NOT NULL ORDER BY motivo',
            'SELECT DISTINCT ubicacion FROM llamadas_bitacora WHERE ubicacion IS NOT NULL ORDER BY ubicacion',
            'SELECT DISTINCT colonia FROM llamadas_bitacora WHERE colonia IS NOT NULL ORDER BY colonia',
            'SELECT DISTINCT peticionario FROM llamadas_bitacora WHERE peticionario IS NOT NULL ORDER BY peticionario',
            'SELECT DISTINCT agente FROM llamadas_bitacora WHERE agente IS NOT NULL ORDER BY agente'
        ];
        
        const resultados = await Promise.all(
            queries.map(sql => pool.execute(sql).then(([rows]) => rows.map(r => Object.values(r)[0])))
        );
        
        return {
            motivos: resultados[0],
            ubicaciones: resultados[1],
            colonias: resultados[2],
            peticionarios: resultados[3],
            agentes: resultados[4]
        };
    }

    // Obtener total de llamadas por turno
    static async getTotalPorTurno(fecha) {
        const sql = `
            SELECT 
                turno,
                COUNT(*) as total
            FROM llamadas_bitacora
            WHERE fecha = ?
            GROUP BY turno
            ORDER BY 
                CASE turno 
                    WHEN 'matutino' THEN 1
                    WHEN 'vespertino' THEN 2
                    WHEN 'nocturno' THEN 3
                END
        `;
        
        const [rows] = await pool.execute(sql, [fecha]);
        return rows;
    }
}

module.exports = LlamadaBitacora;