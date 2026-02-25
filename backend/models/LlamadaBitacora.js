const pool = require('../config/database');

class LlamadaBitacora {

    static getTableName(fecha) {
        if (!fecha) {

            const now = new Date();
            const mes = String(now.getMonth() + 1).padStart(2, '0');
            const año = now.getFullYear();
            return `llamadas_bitacora_${mes}_${año}`;
        }

        let mes, año;
        if (typeof fecha === 'string') {

            const partes = fecha.split('-');
            if (partes.length >= 2) {
                año = partes[0];
                mes = partes[1];
            } else {
                return 'llamadas_bitacora';
            }
        } else if (fecha instanceof Date) {
            mes = String(fecha.getMonth() + 1).padStart(2, '0');
            año = fecha.getFullYear();
        } else {
            return 'llamadas_bitacora';
        }

        return `llamadas_bitacora_${mes}_${año}`;
    }

    static async ensureTableExists(tableName) {

        const sql = `
            CREATE TABLE IF NOT EXISTS ${tableName} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                folio_sistema VARCHAR(50) UNIQUE,
                fecha DATE NOT NULL,
                turno ENUM('matutino', 'vespertino', 'nocturno') NOT NULL,
                hora TIME NOT NULL,
                motivo VARCHAR(255),
                ubicacion VARCHAR(255),
                colonia VARCHAR(255),
                seguimiento TEXT,
                razonamiento TEXT,
                descripcion_detallada TEXT,
                motivo_radio_operacion VARCHAR(255),
                salida ENUM('si', 'no') DEFAULT 'no',
                detenido ENUM('si', 'no') DEFAULT 'no',
                vehiculo VARCHAR(255),
                numero_telefono VARCHAR(20),
                peticionario VARCHAR(255),
                agente VARCHAR(100),
                telefono_agente VARCHAR(20),
                folio_c5 VARCHAR(50),
                conclusion TEXT,
                usuario_id INT,
                hora_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
                actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                latitud DECIMAL(10, 8),
                longitud DECIMAL(11, 8),
                ubicacion_exacta VARCHAR(255)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        try {
            await pool.execute(sql);
        } catch (error) {
            console.error(`Error asegurando que existe la tabla ${tableName}:`, error);
            throw error;
        }
    }

    static async create(llamadaData) {
        const tableName = this.getTableName(llamadaData.fecha);
        await this.ensureTableExists(tableName);

        const sql = `
            INSERT INTO ${tableName}
            (folio_sistema, fecha, turno, hora, motivo, ubicacion, colonia,
             seguimiento, razonamiento, descripcion_detallada, motivo_radio_operacion,
             salida, detenido, vehiculo, numero_telefono,
             peticionario, agente, telefono_agente, folio_c5, conclusion, usuario_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.execute(sql, [
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
            llamadaData.conclusion,
            llamadaData.usuario_id || 1
        ]);

        return { insertId: result.insertId, tableName: tableName };
    }

    static async findById(id, tableName) {
        if (!tableName) {

            tableName = this.getTableName(new Date());
        }

        try {

            const sql = `SELECT lb.* FROM ${tableName} lb WHERE lb.id = ?`;
            const [rows] = await pool.execute(sql, [id]);
            return rows[0];
        } catch (error) {

            if (error.code === 'ER_NO_SUCH_TABLE') return null;
            throw error;
        }
    }

    static async findAll(filtros = {}) {

        let targetDate = filtros.fecha || filtros.mes_objetivo || new Date();
        const tableName = this.getTableName(targetDate);

        try {

            await this.ensureTableExists(tableName);

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
                FROM ${tableName} lb
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

            const [rows] = await pool.execute(sql, params);
            return rows;
        } catch (error) {
            if (error.code === 'ER_NO_SUCH_TABLE') return [];
            throw error;
        }
    }

    static async findAllRaw(filtros = {}) {
        let targetDate = filtros.fecha || filtros.mes_objetivo || new Date();
        const tableName = this.getTableName(targetDate);

        try {
            await this.ensureTableExists(tableName);

            let sql = `SELECT lb.* FROM ${tableName} lb WHERE 1=1`;
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

            const [rows] = await pool.execute(sql, params);
            return rows;
        } catch (error) {
            if (error.code === 'ER_NO_SUCH_TABLE') return [];
            throw error;
        }
    }

    static async countAllRaw(filtros = {}) {
        let targetDate = filtros.fecha || filtros.mes_objetivo || new Date();
        const tableName = this.getTableName(targetDate);

        try {
            await this.ensureTableExists(tableName);

            let sql = `SELECT COUNT(*) as total FROM ${tableName} lb WHERE 1=1`;
            const params = [];

            if (filtros.fecha) {
                sql += ' AND lb.fecha = ?';
                params.push(filtros.fecha);
            }
            if (filtros.turno) {
                sql += ' AND lb.turno = ?';
                params.push(filtros.turno);
            }

            const [rows] = await pool.execute(sql, params);
            return rows[0]?.total || 0;
        } catch (error) {
            if (error.code === 'ER_NO_SUCH_TABLE') return 0;
            throw error;
        }
    }

    static async findByDateRange(fechaInicio, fechaFin) {
        const tableName = this.getTableName(fechaInicio);

        try {
            await this.ensureTableExists(tableName);

            const sql = `
                SELECT lb.*
                FROM ${tableName} lb
                WHERE lb.fecha BETWEEN ? AND ?
                ORDER BY lb.fecha DESC, lb.hora DESC
            `;

            const [rows] = await pool.execute(sql, [fechaInicio, fechaFin]);
            return rows;
        } catch (error) {
            if (error.code === 'ER_NO_SUCH_TABLE') return [];
            throw error;
        }
    }

    static async update(id, tableName, datosActualizados) {
        if (!tableName) {
            tableName = this.getTableName(new Date());
        }

        const campos = [];
        const valores = [];

        Object.keys(datosActualizados).forEach(campo => {
            if (campo !== 'id' && campo !== 'folio_sistema' && campo !== 'tableName') {
                campos.push(`${campo} = ?`);
                valores.push(datosActualizados[campo]);
            }
        });

        if (campos.length === 0) return 0;

        const sql = `UPDATE ${tableName} SET ${campos.join(', ')} WHERE id = ?`;
        valores.push(id);

        try {
            const [result] = await pool.execute(sql, valores);
            return result.affectedRows;
        } catch (error) {
            if (error.code === 'ER_NO_SUCH_TABLE') return 0;
            throw error;
        }
    }

    static async delete(id, tableName) {
        if (!tableName) {
            tableName = this.getTableName(new Date());
        }
        const sql = `DELETE FROM ${tableName} WHERE id = ?`;
        try {
            const [result] = await pool.execute(sql, [id]);
            return result.affectedRows;
        } catch (error) {
            if (error.code === 'ER_NO_SUCH_TABLE') return 0;
            throw error;
        }
    }

    static async getEstadisticas(fechaInicio, fechaFin) {
        const tableName = this.getTableName(fechaInicio);
        try {
            await this.ensureTableExists(tableName);

            const sql = `
                SELECT
                    fecha,
                    COUNT(*) as total_llamadas,
                    SUM(CASE WHEN salida = 'si' THEN 1 ELSE 0 END) as salidas,
                    SUM(CASE WHEN detenido = 'si' THEN 1 ELSE 0 END) as detenidos,
                    COUNT(DISTINCT motivo) as motivos_distintos,
                    COUNT(DISTINCT ubicacion) as ubicaciones_distintas
                FROM ${tableName}
                WHERE fecha BETWEEN ? AND ?
                GROUP BY fecha
                ORDER BY fecha DESC
            `;

            const [rows] = await pool.execute(sql, [fechaInicio, fechaFin]);
            return rows;
        } catch (error) {
            if (error.code === 'ER_NO_SUCH_TABLE') return [];
            throw error;
        }
    }

    static async getDatosAutocompletar() {
        const tableName = this.getTableName(new Date());
        try {
            await this.ensureTableExists(tableName);

            const queries = [
                `SELECT DISTINCT motivo FROM ${tableName} WHERE motivo IS NOT NULL ORDER BY motivo`,
                `SELECT DISTINCT ubicacion FROM ${tableName} WHERE ubicacion IS NOT NULL ORDER BY ubicacion`,
                `SELECT DISTINCT colonia FROM ${tableName} WHERE colonia IS NOT NULL ORDER BY colonia`,
                `SELECT DISTINCT peticionario FROM ${tableName} WHERE peticionario IS NOT NULL ORDER BY peticionario`,
                `SELECT DISTINCT agente FROM ${tableName} WHERE agente IS NOT NULL ORDER BY agente`
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
        } catch (error) {
            if (error.code === 'ER_NO_SUCH_TABLE') return { motivos: [], ubicaciones: [], colonias: [], peticionarios: [], agentes: [] };
            throw error;
        }
    }

    static async getTotalPorTurno(fecha) {
        const tableName = this.getTableName(fecha);
        try {
            await this.ensureTableExists(tableName);

            const sql = `
                SELECT
                    turno,
                    COUNT(*) as total
                FROM ${tableName}
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
        } catch (error) {
            if (error.code === 'ER_NO_SUCH_TABLE') return [];
            throw error;
        }
    }
}

module.exports = LlamadaBitacora;