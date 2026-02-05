/**
 * LlamadasService.js - Servicio para manejar llamadas
 * Versión corregida (sin dependencia de Auth)
 */

class LlamadasService {
    static apiBaseUrl = 'http://localhost:3000/api/llamadas';
    
    // Método auxiliar para obtener headers de autenticación
    static getAuthHeaders() {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    }
    
    // Registrar nueva llamada
    static async registrarLlamada(datosLlamada) {
        try {
            const headers = this.getAuthHeaders();
            const response = await fetch(`${this.apiBaseUrl}/registrar`, {
                method: 'POST',
                headers,
                body: JSON.stringify(datosLlamada)
            });
            const payload = await response.json();
            if (!response.ok) {
                return {
                    success: false,
                    message: payload?.message || 'Error al registrar la llamada',
                    error: payload?.error || null,
                    code: payload?.code || null
                };
            }
            return payload;
        } catch (error) {
            console.error('Error registrando llamada:', error);
            return { success: false, message: 'Error de conexión', error: error.message };
        }
    }
    
    // Obtener lista de llamadas
    static async obtenerLlamadas(filtros = {}) {
        try {
            const headers = this.getAuthHeaders();
            let url = `${this.apiBaseUrl}/listar?`;
            
            // Agregar filtros a la URL
            Object.keys(filtros).forEach(key => {
                if (filtros[key]) {
                    url += `${key}=${encodeURIComponent(filtros[key])}&`;
                }
            });
            
            const response = await fetch(url, { headers });
            return await response.json();
        } catch (error) {
            console.error('Error obteniendo llamadas:', error);
            return { success: false, message: 'Error de conexión', data: [] };
        }
    }
    
    // Obtener una llamada específica
    static async obtenerLlamada(id) {
        try {
            const headers = this.getAuthHeaders();
            const response = await fetch(`${this.apiBaseUrl}/${id}`, { headers });
            return await response.json();
        } catch (error) {
            console.error('Error obteniendo llamada:', error);
            return { success: false, message: 'Error de conexión' };
        }
    }
    
    // Actualizar llamada
    static async actualizarLlamada(id, datos) {
        try {
            const headers = this.getAuthHeaders();
            const response = await fetch(`${this.apiBaseUrl}/${id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(datos)
            });
            
            return await response.json();
        } catch (error) {
            console.error('Error actualizando llamada:', error);
            return { success: false, message: 'Error de conexión' };
        }
    }
    
    // Eliminar llamada
    static async eliminarLlamada(id) {
        try {
            const headers = this.getAuthHeaders();
            const response = await fetch(`${this.apiBaseUrl}/${id}`, {
                method: 'DELETE',
                headers
            });
            
            return await response.json();
        } catch (error) {
            console.error('Error eliminando llamada:', error);
            return { success: false, message: 'Error de conexión' };
        }
    }
    
    // Obtener estadísticas
    static async obtenerEstadisticas(fechaInicio, fechaFin) {
        try {
            const headers = this.getAuthHeaders();
            const url = `${this.apiBaseUrl}/estadisticas/obtener?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
            const response = await fetch(url, { headers });
            return await response.json();
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            return { success: false, message: 'Error de conexión' };
        }
    }
    
    // Obtener datos para autocompletar
    static async obtenerAutocompletar() {
        try {
            const headers = this.getAuthHeaders();
            const response = await fetch(`${this.apiBaseUrl}/autocompletar/obtener`, { headers });
            return await response.json();
        } catch (error) {
            console.error('Error obteniendo autocompletar:', error);
            return { 
                success: false, 
                motivos: [], 
                ubicaciones: [], 
                colonias: [], 
                peticionarios: [], 
                agentes: [] 
            };
        }
    }
    
    // Exportar llamadas
    static async exportarLlamadas(fechaInicio, fechaFin) {
        try {
            const headers = this.getAuthHeaders();
            const url = `${this.apiBaseUrl}/exportar?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
            const response = await fetch(url, { headers });
            return await response.json();
        } catch (error) {
            console.error('Error exportando:', error);
            return { success: false, message: 'Error de conexión' };
        }
    }
    
    // Obtener fecha y hora del servidor
    static async getServerDateTime() {
        try {
            const response = await fetch('http://localhost:3000/api/llamadas/fecha-servidor');
            return await response.json();
        } catch (error) {
            console.error('Error obteniendo fecha:', error);
            const now = new Date();
            return {
                success: true,
                fecha: now.toISOString().split('T')[0],
                hora: now.toTimeString().split(' ')[0].substring(0,5)
            };
        }
    }
}

// Exportar para uso global
window.LlamadasService = LlamadasService;