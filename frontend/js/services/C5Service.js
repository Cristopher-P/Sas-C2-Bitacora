/**
 * C5Service.js - Servicio para manejar reportes C5
 */

class C5Service {
    static apiBaseUrl = '/api/c5';  // Cambia esto si es necesario
    
    // Crear nuevo reporte C5
    static async crearReporte(datosReporte) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No autenticado');
            }

            const response = await fetch(`${this.apiBaseUrl}/crear`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(datosReporte)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `Error ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error('Error creando reporte C5:', error);
            return { 
                success: false, 
                message: error.message || 'Error de conexión con el servidor' 
            };
        }
    }
    
    // Obtener reportes C5
    static async obtenerReportes(filtros = {}) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No autenticado');
            }

            let url = `${this.apiBaseUrl}/listar?_t=${new Date().getTime()}&`;
            
            Object.keys(filtros).forEach(key => {
                if (filtros[key]) {
                    url += `${key}=${encodeURIComponent(filtros[key])}&`;
                }
            });
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `Error ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error('Error obteniendo reportes:', error);
            return { 
                success: false, 
                message: error.message || 'Error de conexión', 
                data: [] 
            };
        }
    }
    
    // Registrar folio C5 (respuesta del C5)
    static async registrarFolioC5(folioC4, folioC5) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No autenticado');
            }

            const response = await fetch(`${this.apiBaseUrl}/registrar-folio-c5`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    folio_c4: folioC4, 
                    folio_c5: folioC5 
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `Error ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error('Error registrando folio C5:', error);
            return { 
                success: false, 
                message: error.message || 'Error de conexión' 
            };
        }
    }
    
    // Generar formato WhatsApp
    static async generarFormatoWhatsApp(id) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No autenticado');
            }

            const response = await fetch(`${this.apiBaseUrl}/${id}/whatsapp`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `Error ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error('Error generando formato:', error);
            return { 
                success: false, 
                message: error.message || 'Error de conexión' 
            };
        }
    }

    // Enviar reporte directamente a C5
    static async enviarReporteC5(id) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No autenticado');
            }

            const response = await fetch(`${this.apiBaseUrl}/${id}/enviar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `Error ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error('Error enviando a C5:', error);
            return { 
                success: false, 
                message: error.message || 'Error de conexión' 
            };
        }
    }
    
    // Abrir WhatsApp
    static abrirWhatsApp(texto, numero = null) {
        const textoCodificado = encodeURIComponent(texto);
        let url;
        
        if (numero) {
            const numeroLimpio = numero.replace(/[+\s\-()]/g, '');
            url = `https://wa.me/${numeroLimpio}?text=${textoCodificado}`;
        } else {
            url = `https://wa.me/?text=${textoCodificado}`;
        }
        
        window.open(url, '_blank');
        return true;
    }
    
    // Copiar al portapapeles
    static async copiarTexto(texto) {
        try {
            await navigator.clipboard.writeText(texto);
            return { 
                success: true, 
                message: 'Texto copiado al portapapeles' 
            };
        } catch (error) {
            console.error('Error copiando texto:', error);
            
            // Fallback para navegadores antiguos
            try {
                const textArea = document.createElement('textarea');
                textArea.value = texto;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                return { 
                    success: true, 
                    message: 'Texto copiado (método alternativo)' 
                };
            } catch (fallbackError) {
                return { 
                    success: false, 
                    message: 'No se pudo copiar el texto' 
                };
            }
        }
    }
}

// Hacer disponible globalmente
window.C5Service = C5Service;