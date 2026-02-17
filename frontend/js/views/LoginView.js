/**
 * LOGINVIEW.JS - Vista de login (para futura implementación)
 */

class LoginView {
    constructor(appController) {
        this.appController = appController;
    }

    render(container) {
        this.container = container;
        this.container.innerHTML = this.getTemplate();
        this.bindEvents();
    }

    getTemplate() {
        return `
            <div class="view-shell view-shell--wide view-form">
                <div class="card" style="max-width: 420px; margin: 0 auto;">
                    <div class="card-body">
                        <div style="text-align: center; margin-bottom: 2rem;">
                            <i class="fas fa-shield-alt" style="font-size: 3rem; color: var(--color-primary);"></i>
                            <h2 style="margin: 1rem 0 0.5rem 0;">Iniciar Sesión</h2>
                            <p class="text-muted">Sistema de Bitácora SAS C4</p>
                        </div>
                        
                        <form id="login-form">
                            <div class="form-group">
                                <label for="username">Usuario</label>
                                <input type="text" id="username" class="form-control" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="password">Contraseña</label>
                                <input type="password" id="password" class="form-control" required>
                            </div>
                            
                            <button type="submit" class="btn btn-primary btn-block">
                                <i class="fas fa-sign-in-alt"></i> Ingresar
                            </button>
                        </form>
                        
                        <div id="login-error" class="alert alert-error" style="display: none; margin-top: 1rem;"></div>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin();
        });
    }

    async handleLogin() {
        // Esto es solo un placeholder para futuro desarrollo
        alert('Módulo de login en desarrollo.\n\nPor ahora usa el login existente en index.html');
    }

    cleanup() {
        // Limpiar event listeners
    }
}
window.LoginView = LoginView;
