const pool = require('../config/database');

class EnvioC5 {
    // Generar folio C4 (DDMMYYHHMM)
    static generarFolioC4(fecha, hora) {
        const date = new Date(`${fecha}T${hora}`);
        const dia = date.getDate().toString().padStart(2, '0');
        const mes = (date.getMonth() + 1).toString().padStart(2, '0');
        const ano = date.getFullYear().toString().substring(2, 4); // últimos 2 dígitos
        const horas = date.getHours().toString().padStart(2, '0');
        const minutos = date.getMinutes().toString().padStart(2, '0');
        
        return `${dia}${mes}${ano}${horas}${minutos}`;
    }

    // Crear nuevo envío
    static async create(envioData) {
        // Generar folio C4
        const folioC4 = this.generarFolioC4(envioData.fecha_envio, envioData.hora_envio);
        
        const sql = `
            INSERT INTO envios_c5 
            (folio_c4, fecha_envio, hora_envio, motivo, ubicacion, 
             descripcion, agente, conclusion, metodo_envio, 
             numero_destino, usuario_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await pool.execute(sql, [
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

    // Registrar folio C5 (respuesta)
    static async registrarFolioC5(folioC4, folioC5) {
        const sql = `
            UPDATE envios_c5 
            SET folio_c5 = ?,
                estado = 'recibido',
                fecha_respuesta = NOW()
            WHERE folio_c4 = ?
        `;
        
        const [result] = await pool.execute(sql, [folioC5, folioC4]);
        return result.affectedRows;
    }

    // Obtener todos los envíos
    static async findAll(filtros = {}) {
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

        const [rows] = await pool.execute(sql, params);
        return rows;
    }

    // Obtener por folio C4
    static async findByFolioC4(folioC4) {
        const sql = `
            SELECT 
                ec.*,
                u.nombre_completo as supervisor
            FROM envios_c5 ec
            JOIN usuarios u ON ec.usuario_id = u.id
            WHERE ec.folio_c4 = ?
        `;
        
        const [rows] = await pool.execute(sql, [folioC4]);
        return rows[0];
    }

    // Obtener por ID
    static async findById(id) {
        const sql = `
            SELECT 
                ec.*,
                u.nombre_completo as supervisor
            FROM envios_c5 ec
            JOIN usuarios u ON ec.usuario_id = u.id
            WHERE ec.id = ?
        `;
        
        const [rows] = await pool.execute(sql, [id]);
        return rows[0];
    }

    // Actualizar estado
    static async actualizarEstado(id, estado) {
        const sql = 'UPDATE envios_c5 SET estado = ? WHERE id = ?';
        const [result] = await pool.execute(sql, [estado, id]);
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
        const sql = `
            SELECT * FROM envios_c5 
            WHERE estado IN ('pendiente', 'enviado')
            ORDER BY fecha_envio ASC, hora_envio ASC
        `;
        
        const [rows] = await pool.execute(sql);
        return rows;
    }
}

module.exports = EnvioC5;