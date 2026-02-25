
class ApiClient {
    constructor() {
        this.baseURL = AppConfig.API_BASE_URL;
        this.token = localStorage.getItem('token');
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

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

    async handleResponse(response) {
        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {

                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/';
                throw new Error(AppConfig.MESSAGES.ERROR_UNAUTHORIZED);
            }

            throw new Error(data.message || AppConfig.MESSAGES.ERROR_SERVER);
        }

        return data;
    }

    handleError(error) {
        console.error('API Error:', error);
        if (error.message === 'Failed to fetch') {
            throw new Error(AppConfig.MESSAGES.ERROR_NETWORK);
        }
        throw error;
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }
}

window.API = new ApiClient();
