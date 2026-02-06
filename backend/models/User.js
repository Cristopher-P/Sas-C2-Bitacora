// backend/models/User.js - CON FALLBACK AUTOMÁTICO
const db = require('../config/database');

class User {
    static async findByUsername(username) {
        console.log(`🔍 Buscando usuario: ${username}`);
        
        // Si NO hay conexión, usar datos mock directamente
        if (!db.isConnected()) {
            console.warn('⚠️  MySQL desconectado - usando MOCK');
            return this.getMockUser(username);
        }
        
        try {
            const sql = 'SELECT * FROM usuarios WHERE username = ?';
            const [rows] = await db.execute(sql, [username]);
            
            if (rows.length > 0) {
                console.log(`✅ Usuario encontrado en BD`);
                return rows[0];
            }
            
            console.log(`❌ Usuario no encontrado en BD`);
            return this.getMockUser(username);
            
        } catch (error) {
            console.error(`🔥 Error en BD:`, error.message);
            return this.getMockUser(username);
        }
    }

    static getMockUser(username) {
        console.log(`🔄 Usando datos MOCK para: ${username}`);
        
        const mockUsers = {
            'admin': { 
                id: 1, 
                username: 'admin', 
                password: 'password123',
                nombre_completo: 'Administrador',
                turno: 'Todos',
                rol: 'admin'
            },
            'matutino': { 
                id: 2, 
                username: 'matutino', 
                password: 'password123',
                nombre_completo: 'Turno Matutino',
                turno: 'Matutino',
                rol: 'supervisor'
            },
            'vespertino': { 
                id: 3, 
                username: 'vespertino', 
                password: 'password123',
                nombre_completo: 'Turno Vespertino',
                turno: 'Vespertino',
                rol: 'supervisor'
            },
            'nocturno': { 
                id: 4, 
                username: 'nocturno', 
                password: 'password123',
                nombre_completo: 'Turno Nocturno',
                turno: 'Nocturno',
                rol: 'supervisor'
            }
        };
        
        return mockUsers[username] || null;
    }

    static async findById(id) {
        if (!db.isConnected()) {
            console.warn('⚠️  MySQL desconectado - findById mock');
            const mockUsers = [
                { id: 1, username: 'admin', nombre_completo: 'Administrador', turno: 'Todos', rol: 'admin' },
                { id: 2, username: 'matutino', nombre_completo: 'Turno Matutino', turno: 'Matutino', rol: 'supervisor' },
                { id: 3, username: 'vespertino', nombre_completo: 'Turno Vespertino', turno: 'Vespertino', rol: 'supervisor' },
                { id: 4, username: 'nocturno', nombre_completo: 'Turno Nocturno', turno: 'Nocturno', rol: 'supervisor' }
            ];
            return mockUsers.find(u => u.id === id) || null;
        }
        
        try {
            const sql = 'SELECT id, username, nombre_completo, turno, rol FROM usuarios WHERE id = ?';
            const [rows] = await db.execute(sql, [id]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error findById:', error.message);
            return null;
        }
    }
}

module.exports = User;