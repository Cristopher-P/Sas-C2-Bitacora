// frontend/js/utils/api.js - Cliente HTTP centralizado
class ApiClient {
    constructor() {
        this.baseURL = AppConfig.API_BASE_URL;
        this.token = localStorage.getItem('token');
    }
    
    // Headers por defecto
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }
    
    // GET request
    async get(endpoint, params = {}) {
        const url = new URL(this.baseURL + endpoint);
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined) {
                url.searchParams.append(key, params[key]);
            }
        });
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            this.handleError(error);
        }
    }
    
    // POST request
    async post(endpoint, data = {}) {
        try {
            const response = await fetch(this.baseURL + endpoint, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            this.handleError(error);
        }
    }
    
    // PUT request
    async put(endpoint, data = {}) {
        try {
            const response = await fetch(this.baseURL + endpoint, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            this.handleError(error);
        }
    }
    
    // DELETE request
    async delete(endpoint) {
        try {
            const response = await fetch(this.baseURL + endpoint, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            
            return await this.handleResponse(response);
        } catch (error) {
            this.handleError(error);
        }
    }
    
    // Manejar respuesta
    async handleResponse(response) {
        const data = await response.json();
        
        if (!response.ok) {
            if (response.status === 401) {
                // No autorizado - limpiar sesión
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/';
                throw new Error(AppConfig.MESSAGES.ERROR_UNAUTHORIZED);
            }
            
            throw new Error(data.message || AppConfig.MESSAGES.ERROR_SERVER);
        }
        
        return data;
    }
    
    // Manejar errores
    handleError(error) {
        console.error('API Error:', error);
        if (error.message === 'Failed to fetch') {
            throw new Error(AppConfig.MESSAGES.ERROR_NETWORK);
        }
        throw error;
    }
    
    // Actualizar token
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }
}

// Instancia global
window.API = new ApiClient();
