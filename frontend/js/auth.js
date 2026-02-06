class Auth {
    static async login(username, password) {
        try {
            const response = await fetch('/api/auth/login', {
            method: 'POST',
              headers: {
                'Content-Type': 'application/json'
                },
            body: JSON.stringify({ username, password })
        });


            const data = await response.json();
            
            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                return data;
            } else {
                throw new Error(data.message || 'Credenciales incorrectas');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    static logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    static isAuthenticated() {
        return !!localStorage.getItem('token');
    }

    static getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    static getToken() {
        return localStorage.getItem('token');
    }

    static async getAuthHeaders() {
        const token = this.getToken();
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }
}

window.Auth = Auth;
