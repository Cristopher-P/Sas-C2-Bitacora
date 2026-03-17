class App {
    constructor() {
        this.currentUser = null;
        this.currentView = null;
        this.socket = null;
        this.init();
    }

    async init() {

        const token = localStorage.getItem('token');

        if (!token) {
            window.location.href = 'index.html';
            return;
        }

        try {

            const response = await window.API.get('/auth/profile');
            if (response && response.success && response.user) {
                this.currentUser = response.user;

                localStorage.setItem('user', JSON.stringify(this.currentUser));

                const loadingOverlay = document.getElementById('session-loading-overlay');
                if (loadingOverlay) loadingOverlay.style.display = 'none';

                const appContainer = document.getElementById('app-container');
                if (appContainer) appContainer.style.display = 'flex';
            } else {
                throw new Error('Validación de perfil fallida');
            }
        } catch (error) {
            console.warn('Sesión inválida o expirada. Forzando cierre.');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('lastView');
            window.location.href = 'index.html';
            return;
        }

        this.updateUserInfo();
        this.setupEventListeners();
        this.setupWebSockets();

        localStorage.removeItem('lastView');
        await this.loadView('dashboard');
    }

    setupWebSockets() {
        if (typeof io !== 'undefined' && this.currentUser) {
            this.socket = io({
                auth: { token: localStorage.getItem('token') }
            });

            this.socket.on('connect', () => {
                console.log('Conectado al servidor de tiempo real (WebSockets)');
            });

            // Lote B: Escuchar Forzar Cierre de Sesión
            this.socket.on(`force_logout_${this.currentUser.id}`, () => {
                console.warn('Cierre de sesión forzado por el administrador.');
                this.socket.disconnect();
                
                // Limpiar sesión y redirigir
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('lastView');
                
                // Guardar un flag para mostrar mensajito de porqué lo sacaron
                localStorage.setItem('logout_reason', 'El administrador ha forzado el cierre de tu sesión.');
                window.location.replace('index.html');
            });

            // Lote B: Mensajes Globales (Broadcast)
            this.socket.on('admin_broadcast', (data) => {
                const { message, type } = data;
                
                // Mostrar alerta visual bloqueante si es importante, sino Toast.
                if (type === 'warning' || type === 'error' || type === 'danger') {
                    alert(`⚠️ MENSAJE DEL SISTEMA:\n\n${message}`);
                } else {
                    if (typeof window.Toast !== 'undefined') {
                        window.Toast.show(message, type || 'info', 10000);
                    } else {
                        alert(`ℹ️ AVISO:\n\n${message}`);
                    }
                }
            });
        }
    }

    updateUserInfo() {
        const userProfile = document.querySelector('.user-profile');
        const userNameEl = document.getElementById('user-name');
        const userRoleEl = document.querySelector('.user-role');

        if (this.currentUser) {
            const isAdmin = this.currentUser.rol === 'admin';

            if (userNameEl) {
                userNameEl.innerHTML = `${this.currentUser.username} ${isAdmin ? '<i class="fas fa-star" title="Admin" style="color:#ffc107; font-size:0.8rem; margin-left:4px;"></i>' : ''}`;
            }
            if (userRoleEl) {
                userRoleEl.textContent = this.currentUser.turno || 'Operador';
            }

            if (isAdmin && userProfile) {
                userProfile.style.cursor = 'pointer';
                userProfile.title = 'Configuración de Administrador';

                // Add hover effect
                userProfile.addEventListener('mouseenter', () => {
                    userProfile.style.opacity = '0.8';
                });
                userProfile.addEventListener('mouseleave', () => {
                    userProfile.style.opacity = '1';
                });

                userProfile.addEventListener('click', () => {
                    const masterPin = prompt(" Seguridad del Sistema \nIngrese el PIN Maestro de Administración:");
                    if (masterPin === "271645116") {
                        this.loadView('admin-settings');
                    } else if (masterPin !== null) {
                        alert("Acceso denegado: PIN incorrecto.");
                    }
                });
            }
        }
    }

    setupEventListeners() {

        const setupNav = (id, viewName) => {
            const el = document.getElementById(id);
            if (el) {

                el.replaceWith(el.cloneNode(true));
                const newEl = document.getElementById(id);

                newEl.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.loadView(viewName);
                });
            }
        };

        setupNav('nav-dashboard', 'dashboard');
        setupNav('nav-llamadas', 'llamadas');

        setupNav('nav-c5', 'c5');
        setupNav('nav-mapacalor', 'mapacalor');

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {

            logoutBtn.replaceWith(logoutBtn.cloneNode(true));
            const newLogoutBtn = document.getElementById('logout-btn');

            newLogoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm("¿Deseas cerrar sesión?")) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('lastView');
                    window.location.href = 'index.html';
                }
            });
        }
    }

    async loadView(viewName) {
        const content = document.getElementById('content');

        // Do not savec admin-settings to lastView, default to dashboard on reload
        if (viewName !== 'admin-settings') {
            localStorage.setItem('lastView', viewName);
        }

        if (this.currentView && typeof this.currentView.cleanup === 'function') {
            this.currentView.cleanup();
        }

        content.className = '';

        content.innerHTML = `
            <div class="loading-container">
                <i class="fas fa-circle-notch fa-spin"></i>
                <p>Cargando ${viewName}...</p>
            </div>
        `;

        this.setActiveNav(viewName);

        try {
            switch (viewName) {
                case 'admin-settings':
                    if (typeof AdminSettingsView === 'undefined') {
                        throw new Error('AdminSettingsView no está cargado');
                    }
                    this.currentView = new AdminSettingsView(this.currentUser, this);
                    await this.currentView.render(content);
                    break;

                case 'dashboard':
                    if (typeof DashboardView === 'undefined') {
                        throw new Error('DashboardView no está cargado');
                    }
                    this.currentView = new DashboardView(this.currentUser, this);
                    await this.currentView.render(content);
                    break;

                case 'llamadas':
                    if (typeof LlamadasView === 'undefined') {
                        throw new Error('LlamadasView no está cargado');
                    }
                    this.currentView = new LlamadasView(this.currentUser, this);
                    await this.currentView.render(content);
                    break;

                case 'c5':
                    if (typeof C5View === 'undefined') {
                        throw new Error('C5View no está cargado');
                    }
                    this.currentView = new C5View(this.currentUser, this);
                    await this.currentView.render(content);
                    break;

                case 'mapacalor':
                    if (typeof MapaCalorView === 'undefined') {
                        throw new Error('MapaCalorView no está cargado');
                    }
                    this.currentView = new MapaCalorView(this);
                    await this.currentView.render(content);
                    break;

                default:
                    console.error('Vista no encontrada:', viewName);
                    await this.loadView('dashboard');
            }
        } catch (error) {
            console.error('Error cargando vista:', error);
            content.innerHTML = `
                <div class="alert alert-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>Error cargando la vista:</strong><br>
                    ${error.message}
                    <br><br>
                    <button onclick="app.loadView('dashboard')" class="btn btn-primary">
                        <i class="fas fa-home"></i> Volver al Dashboard
                    </button>
                </div>
            `;
        }
    }

    setActiveNav(viewName) {
        const map = {
            dashboard: 'nav-dashboard',
            llamadas: 'nav-llamadas',

            c5: 'nav-c5',
            mapacalor: 'nav-mapacalor'
        };

        document.querySelectorAll('#main-nav a').forEach(link => {
            link.classList.remove('active');
        });

        const activeId = map[viewName];
        if (activeId) {
            document.getElementById(activeId)?.classList.add('active');
        }
    }

    goToDashboard() {
        this.loadView('dashboard');
    }

    goToC5() {
        this.loadView('c5');
    }

    goToMapaCalor() {
        this.loadView('mapacalor');
    }
}

document.addEventListener('DOMContentLoaded', () => {

    const requiredClasses = [
        'DashboardView',
        'LlamadasView',
        'C5View',

        'MapaCalorView',
        'AdminSettingsView'
    ];
    const missingClasses = requiredClasses.filter(cls => typeof window[cls] === 'undefined');

    if (missingClasses.length > 0) {
        console.error('Clases faltantes:', missingClasses);
        document.getElementById('content').innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <i class="fas fa-exclamation-triangle fa-3x text-danger"></i>
                <h3>Error de carga</h3>
                <p>Faltan componentes necesarios: ${missingClasses.join(', ')}</p>
                <p>Verifica la consola para más detalles.</p>
                <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    <i class="fas fa-redo"></i> Recargar Página
                </button>
            </div>
        `;
        return;
    }

    window.app = new App();
});

window.App = App;