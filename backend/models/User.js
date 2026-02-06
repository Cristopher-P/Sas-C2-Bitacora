// backend/models/User.js
const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    static async findByUsername(username) {
        console.log(`🔍 Buscando usuario en DB: ${username}`);
        
        try {
            const sql = 'SELECT * FROM usuarios WHERE username = ?';
            const [rows] = await pool.execute(sql, [username]);
            
            console.log(`📊 Resultados DB para ${username}: ${rows.length}`);
            
            if (rows.length > 0) {
                console.log(`✅ Usuario encontrado en DB: ${username}`);
                // Si la contraseña está en texto plano, convertirla a hash
                const user = rows[0];
                if (user.password && !user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
                    console.log(`⚠️  Contraseña en texto plano para ${username}, actualizando a hash...`);
                    await this.hashUserPassword(user.id, user.password);
                    // Volver a obtener el usuario con el hash actualizado
                    const [updatedRows] = await pool.execute(sql, [username]);
                    return updatedRows[0];
                }
                return user;
            }
            
            console.log(`❌ Usuario no encontrado en DB: ${username}`);
            return null;
            
        } catch (error) {
            console.error(`🔥 ERROR DB al buscar usuario ${username}:`, {
                message: error.message,
                code: error.code,
                errno: error.errno,
                sqlState: error.sqlState
            });
            
            // Si hay error de conexión, usar datos mock CON CONTRASEÑAS HASH HEADAS
            return this.getMockUser(username);
        }
    }

    static async findById(id) {
        console.log(`🔍 Buscando usuario por ID: ${id}`);
        
        try {
            const sql = 'SELECT id, username, nombre_completo, turno, rol FROM usuarios WHERE id = ?';
            const [rows] = await pool.execute(sql, [id]);
            
            if (rows.length > 0) {
                return rows[0];
            }
            return null;
            
        } catch (error) {
            console.error(`🔥 ERROR DB al buscar por ID ${id}:`, error.message);
            // Mock para IDs comunes
            const mockUsers = {
                1: { id: 1, username: 'admin', nombre_completo: 'Administrador', turno: 'Todos', rol: 'admin' },
                2: { id: 2, username: 'matutino', nombre_completo: 'Operador Matutino', turno: 'Matutino', rol: 'supervisor' },
                3: { id: 3, username: 'vespertino', nombre_completo: 'Operador Vespertino', turno: 'Vespertino', rol: 'supervisor' },
                4: { id: 4, username: 'nocturno', nombre_completo: 'Operador Nocturno', turno: 'Nocturno', rol: 'supervisor' }
            };
            return mockUsers[id] || null;
        }
    }

    static async create(userData) {
        try {
            // Hashear la contraseña antes de guardar
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(userData.password, salt);
            
            const sql = `
                INSERT INTO usuarios (username, password, nombre_completo, turno, rol)
                VALUES (?, ?, ?, ?, ?)
            `;
            const [result] = await pool.execute(sql, [
                userData.username,
                hashedPassword,
                userData.nombre_completo,
                userData.turno,
                userData.rol || 'supervisor'
            ]);
            
            console.log(`✅ Usuario creado: ${userData.username}`);
            return result.insertId;
            
        } catch (error) {
            console.error('🔥 ERROR DB al crear usuario:', error.message);
            // Retornar un ID mock
            return 999;
        }
    }

    // Método auxiliar para datos mock CON CONTRASEÑAS HASH HEADAS
    static getMockUser(username) {
        console.log(`🔄 Usando datos MOCK para: ${username}`);
        
        // Contraseñas hasheadas de "password123" (generadas con bcrypt)
        const hashedPasswords = {
            'admin': '$2a$10$N9qo8uLOickgx2ZMRZoMye.Z6.8F/6g/5B.4WjW4C3c5O5VQJ/ZK6', // password123
            'matutino': '$2a$10$N9qo8uLOickgx2ZMRZoMye.Z6.8F/6g/5B.4WjW4C3c5O5VQJ/ZK6', // password123
            'vespertino': '$2a$10$N9qo8uLOickgx2ZMRZoMye.Z6.8F/6g/5B.4WjW4C3c5O5VQJ/ZK6', // password123
            'nocturno': '$2a$10$N9qo8uLOickgx2ZMRZoMye.Z6.8F/6g/5B.4WjW4C3c5O5VQJ/ZK6'  // password123
        };
        
        const mockUsers = {
            'admin': { 
                id: 1, 
                username: 'admin', 
                password: hashedPasswords['admin'],
                nombre_completo: 'Administrador del Sistema',
                turno: 'Todos',
                rol: 'admin',
                created_at: new Date().toISOString()
            },
            'matutino': { 
                id: 2, 
                username: 'matutino', 
                password: hashedPasswords['matutino'],
                nombre_completo: 'Operador Matutino',
                turno: 'Matutino',
                rol: 'supervisor',
                created_at: new Date().toISOString()
            },
            'vespertino': { 
                id: 3, 
                username: 'vespertino', 
                password: hashedPasswords['vespertino'],
                nombre_completo: 'Operador Vespertino',
                turno: 'Vespertino',
                rol: 'supervisor',
                created_at: new Date().toISOString()
            },
            'nocturno': { 
                id: 4, 
                username: 'nocturno', 
                password: hashedPasswords['nocturno'],
                nombre_completo: 'Operador Nocturno',
                turno: 'Nocturno',
                rol: 'supervisor',
                created_at: new Date().toISOString()
            }
        };
        
        const user = mockUsers[username];
        if (user) {
            console.log(`✅ Mock user encontrado: ${username}`);
        } else {
            console.log(`❌ Mock user no encontrado: ${username}`);
        }
        return user || null;
    }

    // Método para actualizar contraseña de texto plano a hash
    static async hashUserPassword(userId, plainPassword) {
        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(plainPassword, salt);
            
            await pool.execute(
                'UPDATE usuarios SET password = ? WHERE id = ?',
                [hashedPassword, userId]
            );
            
            console.log(`🔐 Contraseña hasheada para usuario ID: ${userId}`);
            return true;
        } catch (error) {
            console.error('Error hasheando contraseña:', error.message);
            return false;
        }
    }

    // Método para verificar si la tabla existe
    static async checkTableExists() {
        try {
            const [rows] = await pool.execute(`
                SELECT COUNT(*) as count 
                FROM information_schema.tables 
                WHERE table_schema = DATABASE() 
                AND table_name = 'usuarios'
            `);
            return rows[0].count > 0;
        } catch (error) {
            console.error('Error verificando tabla usuarios:', error.message);
            return false;
        }
    }

    // Método para crear tabla si no existe CON CONTRASEÑAS HASH HEADAS
    static async createTableIfNotExists() {
        try {
            const tableExists = await this.checkTableExists();
            
            if (!tableExists) {
                console.log('📦 Creando tabla usuarios...');
                
                await pool.execute(`
                    CREATE TABLE usuarios (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        username VARCHAR(50) UNIQUE NOT NULL,
                        password VARCHAR(255) NOT NULL,
                        nombre_completo VARCHAR(100) NOT NULL,
                        turno VARCHAR(50),
                        rol VARCHAR(50) DEFAULT 'supervisor',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                `);
                
                console.log('✅ Tabla usuarios creada');
                
                // Hashear contraseña para los usuarios de prueba
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash('password123', salt);
                
                // Insertar usuarios de prueba CON CONTRASEÑAS HASH HEADAS
                await pool.execute(`
                    INSERT INTO usuarios (username, password, nombre_completo, turno, rol) 
                    VALUES 
                    ('admin', ?, 'Administrador', 'Todos', 'admin'),
                    ('matutino', ?, 'Turno Matutino', 'Matutino', 'supervisor'),
                    ('vespertino', ?, 'Turno Vespertino', 'Vespertino', 'supervisor'),
                    ('nocturno', ?, 'Turno Nocturno', 'Nocturno', 'supervisor')
                `, [hashedPassword, hashedPassword, hashedPassword, hashedPassword]);
                
                console.log('✅ Usuarios de prueba insertados (contraseñas hasheadas)');
                console.log('🔐 Todos usan la contraseña: password123');
            } else {
                console.log('✅ Tabla usuarios ya existe');
                
                // Verificar y actualizar contraseñas de texto plano a hash
                const [users] = await pool.execute('SELECT id, password FROM usuarios');
                for (const user of users) {
                    if (user.password && !user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
                        console.log(`🔄 Actualizando contraseña texto plano para usuario ID: ${user.id}`);
                        await this.hashUserPassword(user.id, user.password);
                    }
                }
            }
            
        } catch (error) {
            console.error('🔥 Error creando/actualizando tabla usuarios:', error.message);
        }
    }

    // Método para verificar contraseña (útil para testing)
    static async verifyPassword(plainPassword, hashedPassword) {
        try {
            return await bcrypt.compare(plainPassword, hashedPassword);
        } catch (error) {
            console.error('Error verificando contraseña:', error);
            return false;
        }
    }
}

module.exports = User;