const db = require('../config/database');

class EnvioC5 {
    // Datos MOCK para reportes C5
    static getMockEnvios() {
        const now = new Date();
        const mockData = [];
        
        const motivos = ['Robo en domicilio', 'Violencia Familiar', 'Riña callejera', 'Persona lesionada', 'Accidente vehicular'];
        const estados = ['Pendiente', 'En curso', 'Atendido'];
        const ubicaciones = ['Av. Principal #450', 'Calle Morelos #125', 'Blvd. Insurgentes #890', 'Calle Hidalgo #234'];
        
        for (let i = 0; i < 10; i++) {
            const daysAgo = Math.floor(Math.random() * 7);
            const fecha = new Date(now);
            fecha.setDate(fecha.getDate() - daysAgo);
            
            const hora = `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;
            
            mockData.push({
                id: i + 1,
                folio_c4: `C4-${fecha.getDate()}${fecha.getMonth() + 1}${String(fecha.getFullYear()).slice(-2)}${hora.replace(':', '')}`,
                folio_c5: Math.random() > 0.5 ? `C5-${Math.floor(Math.random() * 10000)}` : null,
                fecha_envio: fecha.toISOString().split('T')[0],
                hora_envio: hora,
                motivo: motivos[Math.floor(Math.random() * motivos.length)],
                ubicacion: ubicaciones[Math.floor(Math.random() * ubicaciones.length)],
                descripcion: `Descripción detallada del incidente ${i + 1}`,
                agente: `Agente ${Math.floor(Math.random() * 100) + 1}`,
                conclusion: Math.random() > 0.6 ? 'Se atendió el incidente' : '',
                estado: estados[Math.floor(Math.random() * estados.length)],
                metodo_envio: 'whatsapp',
                numero_destino: '6641234567',
                usuario_id: Math.floor(Math.random() * 4) + 1,
                supervisor: ['Administrador', 'Turno Matutino', 'Turno Vespertino', 'Turno Nocturno'][Math.floor(Math.random() * 4)]
            });
        }
        
        return mockData.sort((a, b) => new Date(b.fecha_envio + ' ' + b.hora_envio) - new Date(a.fecha_envio + ' ' + a.hora_envio));
    }

    // Generar folio C4
    static generarFolioC4(fecha, hora) {
        const date = new Date(`${fecha}T${hora}`);
        const dia = date.getDate().toString().padStart(2, '0');
        const mes = (date.getMonth() + 1).toString().padStart(2, '0');
        const ano = date.getFullYear().toString().substring(2, 4);
        const horas = date.getHours().toString().padStart(2, '0');
        const minutos = date.getMinutes().toString().padStart(2, '0');
        
        return `${dia}${mes}${ano}${horas}${minutos}`;
    }

    // Crear nuevo envío
    static async create(envioData) {
        const folioC4 = this.generarFolioC4(envioData.fecha_envio, envioData.hora_envio);
        
        if (!db.isConnected()) {
            console.warn('⚠️  MOCK: create envío C5');
            return {
                id: Math.floor(Math.random() * 1000) + 1,
                folio_c4: folioC4
            };
        }
        
        const sql = `
            INSERT INTO envios_c5 
            (folio_c4, fecha_envio, hora_envio, motivo, ubicacion, 
             descripcion, agente, conclusion, metodo_envio, 
             numero_destino, usuario_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await db.execute(sql, [
            folioC4,
            envioData.fecha_envio,
            envioData.hora_envio,
            envioData.motivo,
            envioData.ubicacion,
            envioData.descripcion,
            envioData.agente || '',
            envioData.conclusion || '',
            envioData.metodo_envio || 'whatsapp',
            envioData.numero_destino || '',
            envioData.usuario_id
        ]);
        
        return {
            id: result.insertId,
            folio_c4: folioC4
        };
    }

    // Registrar folio C5
    static async registrarFolioC5(folioC4, folioC5) {
        if (!db.isConnected()) {
            console.warn('⚠️  MOCK: registrar folio C5');
            return 1;
        }
        
        const sql = `
            UPDATE envios_c5 
            SET folio_c5 = ?,
                estado = 'recibido',
                fecha_respuesta = NOW()
            WHERE folio_c4 = ?
        `;
        
        const [result] = await db.execute(sql, [folioC5, folioC4]);
        return result.affectedRows;
    }

    // Obtener todos los envíos
    static async findAll(filtros = {}) {
        if (!db.isConnected()) {
            console.warn('⚠️  MOCK: findAll envíos C5');
            let mockData = this.getMockEnvios();
            
            if (filtros.estado) {
                mockData = mockData.filter(e => e.estado === filtros.estado);
            }
            if (filtros.folio_c4) {
                mockData = mockData.filter(e => e.folio_c4.includes(filtros.folio_c4));
            }
            
            return mockData;
        }
        
        let sql = `
            SELECT 
                ec.*,
                u.nombre_completo as supervisor
            FROM envios_c5 ec
            JOIN usuarios u ON ec.usuario_id = u.id
            WHERE 1=1
        `;
        
        const params = [];

        if (filtros.estado) {
            sql += ' AND ec.estado = ?';
            params.push(filtros.estado);
        }
        if (filtros.folio_c4) {
            sql += ' AND ec.folio_c4 LIKE ?';
            params.push(`%${filtros.folio_c4}%`);
        }
        if (filtros.folio_c5) {
            sql += ' AND ec.folio_c5 LIKE ?';
            params.push(`%${filtros.folio_c5}%`);
        }
        if (filtros.fecha_desde) {
            sql += ' AND ec.fecha_envio >= ?';
            params.push(filtros.fecha_desde);
        }
        if (filtros.fecha_hasta) {
            sql += ' AND ec.fecha_envio <= ?';
            params.push(filtros.fecha_hasta);
        }

        sql += ' ORDER BY ec.fecha_envio DESC, ec.hora_envio DESC';

        const [rows] = await db.execute(sql, params);
        return rows;
    }

    // Obtener por folio C4
    static async findByFolioC4(folioC4) {
        if (!db.isConnected()) {
            console.warn('⚠️  MOCK: findByFolioC4');
            return this.getMockEnvios().find(e => e.folio_c4 === folioC4);
        }
        
        const sql = `
            SELECT 
                ec.*,
                u.nombre_completo as supervisor
            FROM envios_c5 ec
            JOIN usuarios u ON ec.usuario_id = u.id
            WHERE ec.folio_c4 = ?
        `;
        
        const [rows] = await db.execute(sql, [folioC4]);
        return rows[0];
    }

    // Obtener por ID
    static async findById(id) {
        if (!db.isConnected()) {
            console.warn('⚠️  MOCK: findById envío C5');
            return this.getMockEnvios().find(e => e.id === parseInt(id));
        }
        
        const sql = `
            SELECT 
                ec.*,
                u.nombre_completo as supervisor
            FROM envios_c5 ec
            JOIN usuarios u ON ec.usuario_id = u.id
            WHERE ec.id = ?
        `;
        
        const [rows] = await db.execute(sql, [id]);
        return rows[0];
    }

    // Actualizar estado
    static async actualizarEstado(id, estado) {
        if (!db.isConnected()) {
            console.warn('⚠️  MOCK: actualizar estado');
            return 1;
        }
        
        const sql = 'UPDATE envios_c5 SET estado = ? WHERE id = ?';
        const [result] = await db.execute(sql, [estado, id]);
        return result.affectedRows;
    }

    // Formatear para WhatsApp
    static formatearParaWhatsApp(envio) {
        return `FOLIO: ${envio.folio_c4}
HORA: ${envio.hora_envio}
MOTIVO: ${envio.motivo}
UBICACIÓN: ${envio.ubicacion}
DESCRIPCIÓN: ${envio.descripcion}
AGENTE: ${envio.agente}
CONCLUSIÓN: ${envio.conclusion}`;
    }

    // Generar enlace WhatsApp
    static generarEnlaceWhatsApp(texto, numero = null) {
        const textoCodificado = encodeURIComponent(texto);
        
        if (numero) {
            const numeroLimpio = numero.replace(/[+\s\-()]/g, '');
            return `https://wa.me/${numeroLimpio}?text=${textoCodificado}`;
        }
        
        return `https://wa.me/?text=${textoCodificado}`;
    }

    // Obtener pendientes
    static async getPendientes() {
        if (!db.isConnected()) {
            console.warn('⚠️  MOCK: getPendientes');
            return this.getMockEnvios().filter(e => e.estado === 'Pendiente' || e.estado === 'En curso');
        }
        
        const sql = `
            SELECT * FROM envios_c5 
            WHERE estado IN ('pendiente', 'enviado')
            ORDER BY fecha_envio ASC, hora_envio ASC
        `;
        
        const [rows] = await db.execute(sql);
        return rows;
    }
}

module.exports = EnvioC5;