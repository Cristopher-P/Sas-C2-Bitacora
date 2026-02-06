const db = require('../config/database');

class LlamadaBitacora {
    // Datos MOCK para cuando MySQL no está disponible
    static getMockLlamadas() {
        const now = new Date();
        const mockData = [];
        
        const turnos = ['Matutino', 'Vespertino', 'Nocturno'];
        const motivos = ['Robo', 'Violencia familiar', 'Accidente vehicular', 'Riña', 'Persona sospechosa', 'Alarma activada'];
        const colonias = ['Centro', 'Del Valle', 'San José', 'Las Flores', 'Industrial'];
        const calles = ['Av. Principal', 'Calle Morelos', 'Av. Juárez', 'Calle Hidalgo', 'Blvd. Revolución'];
        
        for (let i = 0; i < 15; i++) {
            const daysAgo = Math.floor(Math.random() * 7);
            const fecha = new Date(now);
            fecha.setDate(fecha.getDate() - daysAgo);
            
            const hora = `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;
            const turno = turnos[Math.floor(Math.random() * turnos.length)];
            const motivo = motivos[Math.floor(Math.random() * motivos.length)];
            
            mockData.push({
                id: i + 1,
                folio_sistema: `MOCK-${String(i + 1).padStart(4, '0')}`,
                fecha: fecha.toISOString().split('T')[0],
                turno: turno,
                hora: hora,
                motivo: motivo,
                ubicacion: `${calles[Math.floor(Math.random() * calles.length)]} #${Math.floor(Math.random() * 500) + 1}`,
                colonia: colonias[Math.floor(Math.random() * colonias.length)],
                peticionario: `Ciudadano ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
                agente: `Agente ${Math.floor(Math.random() * 100) + 1}`,
                salida: Math.random() > 0.5 ? 'si' : 'no',
                detenido: Math.random() > 0.7 ? 'si' : 'no',
                vehiculo: Math.random() > 0.6 ? 'si' : 'no',
                numero_telefono: `664${Math.floor(Math.random() * 9000000) + 1000000}`,
                seguimiento: Math.random() > 0.5 ? 'si' : 'no',
                hora_registro: new Date().toISOString(),
                latitud: (32.5 + Math.random() * 0.2).toFixed(6),
                longitud: (-117.0 - Math.random() * 0.2).toFixed(6)
            });
        }
        
        return mockData.sort((a, b) => new Date(b.fecha + ' ' + b.hora) - new Date(a.fecha + ' ' + a.hora));
    }

    // Crear nueva llamada
    static async create(llamadaData) {
        if (!db.isConnected()) {
            console.warn('⚠️  MOCK: create llamada');
            return Math.floor(Math.random() * 1000) + 1;
        }
        
        const sql = `
            INSERT INTO llamadas_bitacora 
            (folio_sistema, fecha, turno, hora, motivo, ubicacion, colonia,
             seguimiento, razonamiento, descripcion_detallada, motivo_radio_operacion,
             salida, detenido, vehiculo, numero_telefono,
             peticionario, agente, telefono_agente, folio_c5, conclusion)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await db.execute(sql, [
            llamadaData.folio_sistema,
            llamadaData.fecha,
            llamadaData.turno,
            llamadaData.hora,
            llamadaData.motivo,
            llamadaData.ubicacion,
            llamadaData.colonia,
            llamadaData.seguimiento,
            llamadaData.razonamiento,
            llamadaData.descripcion_detallada,
            llamadaData.motivo_radio_operacion,
            llamadaData.salida,
            llamadaData.detenido,
            llamadaData.vehiculo,
            llamadaData.numero_telefono,
            llamadaData.peticionario,
            llamadaData.agente,
            llamadaData.telefono_agente,
            llamadaData.folio_c5,
            llamadaData.conclusion
        ]);
        
        return result.insertId;
    }

    // Obtener llamada por ID
    static async findById(id) {
        if (!db.isConnected()) {
            console.warn('⚠️  MOCK: findById llamada');
            const mockData = this.getMockLlamadas();
            return mockData.find(l => l.id === parseInt(id));
        }
        
        const sql = `
            SELECT lb.*
            FROM llamadas_bitacora lb
            WHERE lb.id = ?
        `;
        
        const [rows] = await db.execute(sql, [id]);
        return rows[0];
    }

    // Obtener todas las llamadas con filtros
    static async findAll(filtros = {}) {
        if (!db.isConnected()) {
            console.warn('⚠️  MOCK: findAll llamadas');
            let mockData = this.getMockLlamadas();
            
            // Aplicar filtros a datos mock
            if (filtros.fecha) {
                mockData = mockData.filter(l => l.fecha === filtros.fecha);
            }
            if (filtros.turno) {
                mockData = mockData.filter(l => l.turno === filtros.turno);
            }
            if (filtros.motivo) {
                mockData = mockData.filter(l => l.motivo.includes(filtros.motivo));
            }
            if (filtros.limit) {
                mockData = mockData.slice(0, parseInt(filtros.limit));
            }
            
            return mockData;
        }
        
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
                lb.hora_registro,
                lb.latitud,
                lb.longitud,
                lb.ubicacion_exacta
            FROM llamadas_bitacora lb
            WHERE 1=1
        `;
        
        const params = [];

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

        sql += ' ORDER BY lb.fecha DESC, lb.hora DESC';

        if (filtros.limit) {
            sql += ' LIMIT ?';
            params.push(parseInt(filtros.limit));
        }

        const [rows] = await db.execute(sql, params);
        return rows;
    }

    // Obtener todas las llamadas sin JOIN
    static async findAllRaw(filtros = {}) {
        if (!db.isConnected()) {
            return this.findAll(filtros);
        }
        
        let sql = `
            SELECT lb.*
            FROM llamadas_bitacora lb
            WHERE 1=1
        `;

        const params = [];

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

        sql += ' ORDER BY lb.fecha DESC, lb.hora DESC';

        if (filtros.limit) {
            sql += ' LIMIT ?';
            params.push(parseInt(filtros.limit));
        }

        const [rows] = await db.execute(sql, params);
        return rows;
    }

    // Contar llamadas
    static async countAllRaw(filtros = {}) {
        if (!db.isConnected()) {
            console.warn('⚠️  MOCK: countAllRaw');
            const mockData = this.getMockLlamadas();
            return mockData.length;
        }
        
        let sql = `
            SELECT COUNT(*) as total
            FROM llamadas_bitacora lb
            WHERE 1=1
        `;

        const params = [];

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

        const [rows] = await db.execute(sql, params);
        return rows[0]?.total || 0;
    }

    // Métodos adicionales
    static async findByDateRange(fechaInicio, fechaFin) {
        if (!db.isConnected()) {
            console.warn('⚠️  MOCK: findByDateRange');
            return this.getMockLlamadas().filter(l => l.fecha >= fechaInicio && l.fecha <= fechaFin);
        }
        
        const sql = `
            SELECT lb.*
            FROM llamadas_bitacora lb
            WHERE lb.fecha BETWEEN ? AND ?
            ORDER BY lb.fecha DESC, lb.hora DESC
        `;
        
        const [rows] = await db.execute(sql, [fechaInicio, fechaFin]);
        return rows;
    }

    static async update(id, datosActualizados) {
        if (!db.isConnected()) {
            console.warn('⚠️  MOCK: update llamada');
            return 1;
        }
        
        const campos = [];
        const valores = [];
        
        Object.keys(datosActualizados).forEach(campo => {
            if (campo !== 'id' && campo !== 'folio_sistema') {
                campos.push(`${campo} = ?`);
                valores.push(datosActualizados[campo]);
            }
        });
        
        if (campos.length === 0) return 0;
        
        const sql = `UPDATE llamadas_bitacora SET ${campos.join(', ')} WHERE id = ?`;
        valores.push(id);
        
        const [result] = await db.execute(sql, valores);
        return result.affectedRows;
    }

    static async delete(id) {
        if (!db.isConnected()) {
            console.warn('⚠️  MOCK: delete llamada');
            return 1;
        }
        
        const sql = 'DELETE FROM llamadas_bitacora WHERE id = ?';
        const [result] = await db.execute(sql, [id]);
        return result.affectedRows;
    }

    static async getEstadisticas(fechaInicio, fechaFin) {
        if (!db.isConnected()) {
            console.warn('⚠️  MOCK: getEstadisticas');
            return [];
        }
        
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
        
        const [rows] = await db.execute(sql, [fechaInicio, fechaFin]);
        return rows;
    }

    static async getDatosAutocompletar() {
        if (!db.isConnected()) {
            console.warn('⚠️  MOCK: getDatosAutocompletar');
            return {
                motivos: ['Robo', 'Violencia familiar', 'Accidente vehicular'],
                ubicaciones: ['Av. Principal', 'Calle Morelos'],
                colonias: ['Centro', 'Del Valle'],
                peticionarios: ['Ciudadano A', 'Ciudadano B'],
                agentes: ['Agente 1', 'Agente 2']
            };
        }
        
        const queries = [
            'SELECT DISTINCT motivo FROM llamadas_bitacora WHERE motivo IS NOT NULL ORDER BY motivo',
            'SELECT DISTINCT ubicacion FROM llamadas_bitacora WHERE ubicacion IS NOT NULL ORDER BY ubicacion',
            'SELECT DISTINCT colonia FROM llamadas_bitacora WHERE colonia IS NOT NULL ORDER BY colonia',
            'SELECT DISTINCT peticionario FROM llamadas_bitacora WHERE peticionario IS NOT NULL ORDER BY peticionario',
            'SELECT DISTINCT agente FROM llamadas_bitacora WHERE agente IS NOT NULL ORDER BY agente'
        ];
        
        const resultados = await Promise.all(
            queries.map(sql => db.execute(sql).then(([rows]) => rows.map(r => Object.values(r)[0])))
        );
        
        return {
            motivos: resultados[0],
            ubicaciones: resultados[1],
            colonias: resultados[2],
            peticionarios: resultados[3],
            agentes: resultados[4]
        };
    }

    static async getTotalPorTurno(fecha) {
        if (!db.isConnected()) {
            console.warn('⚠️  MOCK: getTotalPorTurno');
            return [
                { turno: 'Matutino', total: 5 },
                { turno: 'Vespertino', total: 6 },
                { turno: 'Nocturno', total: 4 }
            ];
        }
        
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
        
        const [rows] = await db.execute(sql, [fecha]);
        return rows;
    }
}

module.exports = LlamadaBitacora;