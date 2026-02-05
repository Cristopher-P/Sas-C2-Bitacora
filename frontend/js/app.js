/**
 * APP.JS - Controlador principal simplificado
 * Maneja navegación, autenticación y carga de vistas
 */

class App {
    constructor() {
        this.currentUser = null;
        this.currentView = null;
        this.init();
    }

    async init() {
        // 1. Verificar sesión (ya hay validación en HTML, pero por seguridad)
        const userStr = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (!userStr || !token) {
            window.location.href = 'index.html';
            return;
        }
        
        try {
            this.currentUser = JSON.parse(userStr);
        } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.clear();
            window.location.href = 'index.html';
            return;
        }
        
        // 2. Configurar Interfaz Inicial
        this.updateUserInfo();
        this.setupEventListeners();
        
        // 3. Cargar vista inicial (Dashboard)
        await this.loadView('dashboard');
    }

    updateUserInfo() {
        const userInfo = document.getElementById('user-info');
        if (userInfo && this.currentUser) {
            userInfo.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="text-align: right;">
                        <div style="font-weight: 700; font-size: 0.9rem;">${this.currentUser.username}</div>
                        <div style="font-size: 0.75rem; opacity: 0.8; background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 10px;">
                            ${this.currentUser.turno || 'Operador'}
                        </div>
                    </div>
                    <i class="fas fa-user-circle" style="font-size: 2rem;"></i>
                </div>
            `;
        }
    }

    setupEventListeners() {
        // Navegación del Menú
        const setupNav = (id, viewName) => {
            const el = document.getElementById(id);
            if (el) {
                // Remover listener anterior si existe
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
        setupNav('nav-buscar', 'buscar');
        setupNav('nav-c5', 'c5');
        setupNav('nav-mapacalor', 'mapacalor'); // ← NUEVO: Enlace para mapa de calor
        
        // Logout - ¡IMPORTANTE! Esto debe estar aquí
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            // Remover listener anterior si existe
            logoutBtn.replaceWith(logoutBtn.cloneNode(true));
            const newLogoutBtn = document.getElementById('logout-btn');
            
            newLogoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if(confirm("¿Deseas cerrar sesión?")) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = 'index.html';
                }
            });
        }
    }

    async loadView(viewName) {
        const content = document.getElementById('content');
        
        // Limpiar vista anterior
        if (this.currentView && typeof this.currentView.cleanup === 'function') {
            this.currentView.cleanup();
        }

        // Mostrar loader
        content.innerHTML = `
            <div class="loading-container">
                <i class="fas fa-circle-notch fa-spin"></i>
                <p>Cargando ${viewName}...</p>
            </div>
        `;

        this.setActiveNav(viewName);

        // Cargar nueva vista con pequeño delay para que se vea el loader
        setTimeout(async () => {
            try {
                switch(viewName) {
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
                        
                    case 'buscar':
                        if (typeof BuscarView === 'undefined') {
                            throw new Error('BuscarView no está cargado');
                        }
                        this.currentView = new BuscarView(this.currentUser, this);
                        await this.currentView.render(content);
                        break;
                        
                    case 'mapacalor':  // ← NUEVO: Vista del mapa de calor
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
        }, 100);
    }

    setActiveNav(viewName) {
        const map = {
            dashboard: 'nav-dashboard',
            llamadas: 'nav-llamadas',
            buscar: 'nav-buscar',
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

    // Métodos de navegación pública (para usar desde las vistas)
    goToDashboard() {
        this.loadView('dashboard');
    }

    goToC5() {
        this.loadView('c5');
    }

    goToMapaCalor() {  // ← NUEVO: Método para ir al mapa de calor
        this.loadView('mapacalor');
    }
}

// Inicialización segura
document.addEventListener('DOMContentLoaded', () => {
    // Verificar que todas las dependencias estén cargadas
    const requiredClasses = [
        'DashboardView', 
        'LlamadasView', 
        'C5View', 
        'BuscarView',
        'MapaCalorView'  // ← NUEVO: Agregar MapaCalorView a las dependencias
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
    
    // Inicializar la aplicación
    window.app = new App();
});

// Hacer disponible globalmente para acceso desde las vistas
window.App = App;