class AdminSettingsView {
    constructor(currentUser, appController) {
        this.currentUser = currentUser;
        this.appController = appController;
        this.container = null;
        this.expandedContainer = null;
        this.originalContainer = null;
        this.colors = {
            primary: '#003366',
            secondary: '#0a4d8c',
            accent: '#ff6b35',
            accentGreen: '#28a745',
            accentRed: '#dc3545',
            light: '#f8f9fa',
            dark: '#212529',
            gray: '#6c757d',
            border: '#dee2e6'
        };
        this.users = [];
        this.settings = { reset_diario_activo: false };
        this.logs = [];
        this.trash = [];
        this.kardex = [];
        this.catalogos = [];
        this.solicitudes = [];
        this.activeTab = 'usuarios';
    }

    async render(container) {
        if (this.currentUser?.rol !== 'admin') {
            alert('Acceso denegado: Se requieren permisos de administrador.');
            this.appController.goToDashboard();
            return;
        }

        this.originalContainer = container;
        this.expandedContainer = document.createElement('div');
        this.expandedContainer.className = 'dashboard-cerit-tehuacan view-bleed view-shell view-form';
        
        this.originalContainer.innerHTML = '';
        this.originalContainer.appendChild(this.expandedContainer);
        
        this.container = this.expandedContainer;
        
        // Show loading state first
        this.container.innerHTML = `
            <div class="cerit-dashboard view-shell--xl">
                <div style="text-align: center; padding: 50px;">
                    <i class="fas fa-circle-notch fa-spin fa-3x text-primary"></i>
                    <h3 style="margin-top:20px;">Cargando configuración de administrador...</h3>
                </div>
            </div>
        `;

        await Promise.all([
            this.loadUsers(), 
            this.loadSettings(),
            this.loadLogs(),
            this.loadTrash(),
            this.loadKardex(),
            this.loadCatalogos(),
            this.loadSolicitudes()
        ]);
        
        this.renderContent();
    }

    renderContent() {
        this.container.innerHTML = this.getTemplate();
        this.bindEvents();
    }

    async loadUsers() {
        try {
            const response = await fetch('/api/admin/users', {
                headers: LlamadasService.getAuthHeaders()
            });
            const data = await response.json();
            if (data.success) {
                this.users = data.data;
            }
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    async loadSettings() {
        try {
            const response = await fetch('/api/admin/settings', {
                headers: LlamadasService.getAuthHeaders()
            });
            const data = await response.json();
            if (data.success && data.data) {
                this.settings = data.data;
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    async loadLogs() {
        try {
            const response = await fetch('/api/admin/logs', { headers: LlamadasService.getAuthHeaders() });
            const data = await response.json();
            if (data.success) this.logs = data.data;
        } catch (error) { console.error('Error loading logs:', error); }
    }

    async loadTrash() {
        try {
            const response = await fetch('/api/admin/trash', { headers: LlamadasService.getAuthHeaders() });
            const data = await response.json();
            if (data.success) this.trash = data.data;
        } catch (error) { console.error('Error loading trash:', error); }
    }

    async loadKardex() {
        try {
            const response = await fetch('/api/admin/kardex', { headers: LlamadasService.getAuthHeaders() });
            const data = await response.json();
            if (data.success) this.kardex = data.data;
        } catch (error) { console.error('Error loading kardex:', error); }
    }

    async loadCatalogos() {
        try {
            const response = await fetch('/api/admin/catalogos', { headers: LlamadasService.getAuthHeaders() });
            const data = await response.json();
            if (data.success) this.catalogos = data.data;
        } catch (error) { console.error('Error loading catalogos:', error); }
    }

    async loadSolicitudes() {
        try {
            const response = await fetch('/api/admin/solicitudes-edicion', { headers: LlamadasService.getAuthHeaders() });
            const data = await response.json();
            if (data.success) {
                this.solicitudes = data.data;
            }
        } catch (error) {
            console.error('Error loading solicitudes:', error);
        }
    }

    getTemplate() {
        return `
            <style>
                .admin-tab-btn {
                    padding: 10px 20px;
                    background: transparent;
                    border: none;
                    border-bottom: 3px solid transparent;
                    color: ${this.colors.gray};
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 1rem;
                }
                .admin-tab-btn:hover { color: ${this.colors.primary}; }
                .admin-tab-btn.active {
                    color: ${this.colors.primary};
                    border-bottom-color: ${this.colors.accent};
                }
                .admin-tab-content { display: none; }
                .admin-tab-content.active { display: block; animation: fadeIn 0.3s; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            </style>
            <div class="cerit-dashboard view-shell--xl">
                <!-- HEADER -->
                <div style="margin-bottom: 25px; display: flex; align-items: center; justify-content: space-between;">
                    <h1 style="margin: 0; color: ${this.colors.primary}; font-size: 1.8rem; font-weight: 800; display: flex; align-items: center; gap: 12px;">
                        <i class="fas fa-cogs"></i> Panel de Administración
                    </h1>
                    <button class="btn btn-secondary btn-back-to-main" style="padding: 10px 20px; border-radius: 5px; cursor: pointer; border: 1px solid ${this.colors.border}; background: white;">
                        <i class="fas fa-arrow-left"></i> Volver al Dashboard
                    </button>
                </div>

                <!-- TABS NAVIGATION -->
                <div style="display: flex; gap: 10px; margin-bottom: 25px; border-bottom: 1px solid ${this.colors.border}; overflow-x: auto; padding-bottom: 10px;">
                    <button class="admin-tab-btn ${this.activeTab === 'usuarios' ? 'active' : ''}" data-tab="usuarios"><i class="fas fa-users"></i> Usuarios & Ajustes</button>
                    <button class="admin-tab-btn ${this.activeTab === 'catalogos' ? 'active' : ''}" data-tab="catalogos"><i class="fas fa-tags"></i> Opciones Desplegables</button>
                    <button class="admin-tab-btn ${this.activeTab === 'kardex' ? 'active' : ''}" data-tab="kardex"><i class="fas fa-chart-bar"></i> Kardex Operativo</button>
                    <button class="admin-tab-btn ${this.activeTab === 'logs' ? 'active' : ''}" data-tab="logs"><i class="fas fa-list-alt"></i> Auditoría (Logs)</button>
                    <button class="admin-tab-btn ${this.activeTab === 'papelera' ? 'active' : ''}" data-tab="papelera"><i class="fas fa-trash-restore"></i> Papelera de Reciclaje</button>
                    <button class="admin-tab-btn ${this.activeTab === 'ediciones' ? 'active' : ''}" data-tab="ediciones"><i class="fas fa-edit"></i> Aprobación de Ediciones</button>
                </div>

                <div style="display: grid; grid-template-columns: 1fr; gap: 30px;">
                    
                    <!-- TAB: USUARIOS Y AJUSTES -->
                    <div id="tab-usuarios" class="admin-tab-content ${this.activeTab === 'usuarios' ? 'active' : ''}">
                        <!-- CONFIGURACIÓN DEL SISTEMA -->
                        <div style="background: white; border-radius: 10px; padding: 30px; border: 1px solid ${this.colors.border}; border-top: 5px solid ${this.colors.accent}; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 30px;">
                        <h2 style="margin: 0 0 20px 0; color: ${this.colors.dark}; font-size: 1.3rem;">
                            <i class="fas fa-sliders-h"></i> Configuración del Sistema
                        </h2>
                        
                        <div style="display: flex; align-items: center; justify-content: space-between; background: ${this.colors.light}; padding: 20px; border-radius: 8px; border: 1px solid ${this.colors.border};">
                            <div>
                                <h3 style="margin: 0 0 5px 0; font-size: 1.1rem; color: ${this.colors.dark};">Reset Diario Automático</h3>
                                <p style="margin: 0; color: ${this.colors.gray}; font-size: 0.9rem;">
                                    Si está activado, el panel principal mostrará exclusivamente los registros del día actual en lugar de todo el mes.
                                </p>
                            </div>
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <span id="reset-status-text" style="font-weight: bold; color: ${this.settings.reset_diario_activo ? this.colors.accentGreen : this.colors.gray};">
                                    ${this.settings.reset_diario_activo ? 'ACTIVADO' : 'DESACTIVADO'}
                                </span>
                                <label class="switch" style="position: relative; display: inline-block; width: 60px; height: 34px;">
                                    <input type="checkbox" id="toggle-reset-diario" ${this.settings.reset_diario_activo ? 'checked' : ''} style="opacity: 0; width: 0; height: 0;">
                                    <span class="slider round" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: ${this.settings.reset_diario_activo ? this.colors.accentGreen : '#ccc'}; transition: .4s; border-radius: 34px;">
                                        <span style="position: absolute; content: ''; height: 26px; width: 26px; left: ${this.settings.reset_diario_activo ? '28px' : '4px'}; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%;"></span>
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div style="display: flex; align-items: center; justify-content: space-between; background: ${this.colors.light}; padding: 20px; border-radius: 8px; border: 1px solid ${this.colors.border}; margin-top: 15px;">
                            <div>
                                <h3 style="margin: 0 0 5px 0; font-size: 1.1rem; color: ${this.colors.dark};">Modo Mantenimiento (Cierre de Sistema)</h3>
                                <p style="margin: 0; color: ${this.colors.gray}; font-size: 0.9rem;">
                                    Al activar, se forzará la salida de todos los usuarios (excepto el tuyo). Nadie más podrá iniciar sesión hasta que lo desactives.
                                </p>
                            </div>
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <span class="maintenance-status-text" style="font-weight: bold; color: ${this.settings.modo_mantenimiento ? this.colors.accentRed : this.colors.gray};">
                                    ${this.settings.modo_mantenimiento ? 'ACTIVADO' : 'DESACTIVADO'}
                                </span>
                                <label class="switch" style="position: relative; display: inline-block; width: 60px; height: 34px;">
                                    <input type="checkbox" id="toggle-mantenimiento" ${this.settings.modo_mantenimiento ? 'checked' : ''} style="opacity: 0; width: 0; height: 0;">
                                    <span class="slider round slider-mantenimiento" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: ${this.settings.modo_mantenimiento ? this.colors.accentRed : '#ccc'}; transition: .4s; border-radius: 34px;">
                                        <span class="slider-dot-mantenimiento" style="position: absolute; content: ''; height: 26px; width: 26px; left: ${this.settings.modo_mantenimiento ? '28px' : '4px'}; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%;"></span>
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div style="display: flex; align-items: center; justify-content: space-between; background: ${this.colors.light}; padding: 20px; border-radius: 8px; border: 1px solid ${this.colors.border}; margin-top: 15px;">
                            <div>
                                <h3 style="margin: 0 0 5px 0; font-size: 1.1rem; color: ${this.colors.dark};">Edición Estricta (Soft Lock)</h3>
                                <p style="margin: 0; color: ${this.colors.gray}; font-size: 0.9rem;">
                                    Si está activado, los operadores no podrán modificar llamadas directamente. Sus cambios se enviarán a una cola de "Aprobación de Ediciones" para que un administrador los revise.
                                </p>
                            </div>
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <span class="edicion-status-text" style="font-weight: bold; color: ${this.settings.edicion_estricta === 'true' || this.settings.edicion_estricta === true ? this.colors.accentGreen : this.colors.gray};">
                                    ${this.settings.edicion_estricta === 'true' || this.settings.edicion_estricta === true ? 'ACTIVADO' : 'DESACTIVADO'}
                                </span>
                                <label class="switch" style="position: relative; display: inline-block; width: 60px; height: 34px;">
                                    <input type="checkbox" id="toggle-edicion-estricta" ${this.settings.edicion_estricta === 'true' || this.settings.edicion_estricta === true ? 'checked' : ''} style="opacity: 0; width: 0; height: 0;">
                                    <span class="slider round slider-edicion" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: ${this.settings.edicion_estricta === 'true' || this.settings.edicion_estricta === true ? this.colors.accentGreen : '#ccc'}; transition: .4s; border-radius: 34px;">
                                        <span class="slider-dot-edicion" style="position: absolute; content: ''; height: 26px; width: 26px; left: ${this.settings.edicion_estricta === 'true' || this.settings.edicion_estricta === true ? '28px' : '4px'}; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%;"></span>
                                    </span>
                                </label>
                            </div>
                        </div>
                        </div>

                        <!-- LOTE B: MENSAJE GLOBAL (BROADCAST) -->
                        <div style="margin-top: 20px; background: ${this.colors.light}; padding: 20px; border-radius: 8px; border: 1px solid ${this.colors.border}; border-left: 4px solid #17a2b8;">
                            <h3 style="margin: 0 0 10px 0; font-size: 1.1rem; color: ${this.colors.dark};"><i class="fas fa-bullhorn"></i> Enviar Mensaje Global</h3>
                            <p style="margin: 0 0 15px 0; color: ${this.colors.gray}; font-size: 0.9rem;">
                                Envía un aviso en tiempo real a todos los operadores conectados (ej. Mantenimiento).
                            </p>
                            <div style="display: flex; gap: 10px;">
                                <input type="text" id="input-broadcast-msg" class="form-control" placeholder="Escribe el mensaje aquí..." style="flex: 1; padding: 10px; border: 1px solid ${this.colors.border}; border-radius: 4px;">
                                <select id="input-broadcast-type" class="form-control" style="padding: 10px; border: 1px solid ${this.colors.border}; border-radius: 4px; width: 130px;">
                                    <option value="info">Info</option>
                                    <option value="warning">Advertencia</option>
                                    <option value="error">Alerta Roja</option>
                                </select>
                                <button id="btn-send-broadcast" style="padding: 10px 20px; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
                                    Enviar
                                </button>
                            </div>
                        </div>

                        <!-- LOTE C: EXPORTACIÓN MAESTRA (.ZIP) -->
                        <div style="margin-top: 20px; background: ${this.colors.light}; padding: 20px; border-radius: 8px; border: 1px solid ${this.colors.border}; border-left: 4px solid ${this.colors.primary};">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <h3 style="margin: 0 0 10px 0; font-size: 1.1rem; color: ${this.colors.dark};">
                                        <i class="fas fa-file-archive"></i> Exportación Maestra (Respaldo Completo)
                                    </h3>
                                    <p style="margin: 0; color: ${this.colors.gray}; font-size: 0.9rem;">
                                        Genera un archivo .zip con el volcado completo de todas las tablas de la base de datos (Llamadas, Envíos C5, Usuarios, Auditoría) en formato CSV.
                                    </p>
                                </div>
                                <div>
                                    <button id="btn-descargar-backup" style="padding: 12px 24px; background: ${this.colors.primary}; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; transition: opacity 0.2s; display: flex; align-items: center; gap: 8px;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
                                        <i class="fas fa-download"></i> Descargar .ZIP
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- GESTIÓN DE USUARIOS -->
                    <div style="background: white; border-radius: 10px; padding: 30px; border: 1px solid ${this.colors.border}; border-top: 5px solid ${this.colors.primary}; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                            <h2 style="margin: 0; color: ${this.colors.dark}; font-size: 1.3rem;">
                                <i class="fas fa-users"></i> Gestión de Usuarios
                            </h2>
                            <button id="btn-nuevo-usuario" style="padding: 10px 20px; background: ${this.colors.accentGreen}; color: white; border: none; border-radius: 6px; cursor: pointer; transition: all 0.2s; font-weight: 600; display: flex; align-items: center; gap: 8px;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                                <i class="fas fa-user-plus"></i> Nuevo Usuario
                            </button>
                        </div>
                        
                        <div class="table-scroll-container" style="overflow-x: auto;">
                            <table class="dashboard-table" style="width: 100%; border-collapse: collapse;">
                                <thead>
                                    <tr style="background: ${this.colors.light}; border-bottom: 2px solid ${this.colors.border};">
                                        <th style="padding: 12px; text-align: left; color: ${this.colors.gray}; font-size: 0.85rem;">ID</th>
                                        <th style="padding: 12px; text-align: left; color: ${this.colors.gray}; font-size: 0.85rem;">USUARIO (LOGIN)</th>
                                        <th style="padding: 12px; text-align: left; color: ${this.colors.gray}; font-size: 0.85rem;">NOMBRE OPERATIVO</th>
                                        <th style="padding: 12px; text-align: left; color: ${this.colors.gray}; font-size: 0.85rem;">TURNO</th>
                                        <th style="padding: 12px; text-align: left; color: ${this.colors.gray}; font-size: 0.85rem;">ROL</th>
                                        <th style="padding: 12px; text-align: left; color: ${this.colors.gray}; font-size: 0.85rem;" title="Separadas por comas">IP PERMITIDAS</th>
                                        <th style="padding: 12px; text-align: center; color: ${this.colors.gray}; font-size: 0.85rem;">ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.users.map(user => `
                                        <tr style="border-bottom: 1px solid ${this.colors.border};">
                                            <td style="padding: 12px; font-weight: bold; color: ${this.colors.gray};">#${user.id}</td>
                                            <td style="padding: 12px;">
                                                <input type="text" id="user-login-${user.id}" class="form-control" value="${user.username}" style="width: 100%; font-family: monospace; font-size: 1rem; padding: 8px; border: 1px solid ${this.colors.border}; border-radius: 4px;">
                                            </td>
                                            <td style="padding: 12px;">
                                                <input type="text" id="user-name-${user.id}" class="form-control" value="${user.nombre_completo}" style="width: 100%; padding: 8px; border: 1px solid ${this.colors.border}; border-radius: 4px;">
                                            </td>
                                            <td style="padding: 12px; text-transform: uppercase; font-size: 0.85rem;">
                                                <span style="background: ${this.colors.light}; padding: 4px 8px; border-radius: 4px; border: 1px solid ${this.colors.border};">${user.turno}</span>
                                            </td>
                                            <td style="padding: 12px; text-transform: uppercase; font-size: 0.85rem; font-weight: bold; color: ${user.rol === 'admin' ? this.colors.accentRed : this.colors.primary};">${user.rol}</td>
                                            <td style="padding: 12px;">
                                                <input type="text" id="user-ip-${user.id}" class="form-control" value="${user.ip_permitida || ''}" placeholder="Cualquiera" style="width: 100%; padding: 8px; border: 1px solid ${this.colors.border}; border-radius: 4px; font-size: 0.85rem;">
                                            </td>
                                            <td style="padding: 12px; text-align: center; white-space: nowrap;">
                                                <button class="btn-guardar-usuario" data-id="${user.id}" style="padding: 8px 15px; background: ${this.colors.primary}; color: white; border: none; border-radius: 4px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='${this.colors.secondary}'" onmouseout="this.style.background='${this.colors.primary}'">
                                                    <i class="fas fa-save"></i> Guardar
                                                </button>
                                                <button class="btn-cambiar-password" data-id="${user.id}" data-username="${user.username}" style="padding: 8px 12px; background: #ffc107; color: ${this.colors.dark}; border: none; border-radius: 4px; cursor: pointer; transition: all 0.2s; margin-left: 5px;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'" title="Cambiar Contraseña">
                                                    <i class="fas fa-key"></i>
                                                </button>
                                                ${user.id !== this.currentUser.id ? `
                                                <button class="btn-forzar-cierre" data-id="${user.id}" data-username="${user.username}" style="padding: 8px 12px; background: ${this.colors.accentRed}; color: white; border: none; border-radius: 4px; cursor: pointer; transition: all 0.2s; margin-left: 5px;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'" title="Cerrar sesión a la fuerza">
                                                    <i class="fas fa-plug"></i>
                                                </button>
                                                ` : ''}
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div> <!-- FIN TAB USUARIOS -->

                    <!-- TAB: CATÁLOGOS -->
                    <div id="tab-catalogos" class="admin-tab-content ${this.activeTab === 'catalogos' ? 'active' : ''}">
                        <div style="background: white; border-radius: 10px; padding: 30px; border: 1px solid ${this.colors.border}; border-top: 5px solid #6f42c1; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 30px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                                <div>
                                    <h2 style="margin: 0; color: ${this.colors.dark}; font-size: 1.3rem;">
                                        <i class="fas fa-list"></i> Motivos de Llamada
                                    </h2>
                                    <p style="margin: 5px 0 0 0; color: ${this.colors.gray}; font-size: 0.9rem;">Opciones mostradas al operador en el formulario de llamadas.</p>
                                </div>
                                <div style="display: flex; gap: 10px;">
                                    <input type="text" id="nuevo-motivo-input" class="form-control" placeholder="Nuevo motivo..." style="padding: 8px; border: 1px solid ${this.colors.border}; border-radius: 4px;">
                                    <button class="btn-agregar-catalogo" data-tipo="motivo_llamada" data-input="nuevo-motivo-input" style="padding: 8px 15px; background: #6f42c1; color: white; border: none; border-radius: 4px; cursor: pointer; transition: opacity 0.2s;"><i class="fas fa-plus"></i></button>
                                </div>
                            </div>
                            
                            <table class="dashboard-table" style="width: 100%; border-collapse: collapse;">
                                <thead>
                                    <tr style="background: ${this.colors.light}; border-bottom: 2px solid ${this.colors.border};">
                                        <th style="padding: 12px; text-align: left; color: ${this.colors.gray}; font-size: 0.85rem;">OPCIÓN (VALOR)</th>
                                        <th style="padding: 12px; text-align: center; color: ${this.colors.gray}; font-size: 0.85rem; width: 100px;">ESTADO</th>
                                        <th style="padding: 12px; text-align: center; color: ${this.colors.gray}; font-size: 0.85rem; width: 150px;">ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.catalogos.filter(c => c.tipo === 'motivo_llamada').map(c => `
                                        <tr style="border-bottom: 1px solid ${this.colors.border}; ${!c.activo ? 'opacity: 0.6;' : ''}">
                                            <td style="padding: 12px;">
                                                <input type="text" id="cat-valor-${c.id}" class="form-control" value="${c.valor}" style="width: 100%; padding: 8px; border: 1px solid ${this.colors.border}; border-radius: 4px;">
                                            </td>
                                            <td style="padding: 12px; text-align: center;">
                                                <span style="font-size: 0.8rem; padding: 4px 8px; border-radius: 12px; background: ${c.activo ? '#d4edda' : '#f8d7da'}; color: ${c.activo ? '#155724' : '#721c24'};">${c.activo ? 'Activo' : 'Oculto'}</span>
                                            </td>
                                            <td style="padding: 12px; text-align: center; white-space: nowrap;">
                                                <button class="btn-guardar-catalogo" data-id="${c.id}" data-activo="${c.activo}" style="padding: 6px 10px; background: ${this.colors.secondary}; color: white; border: none; border-radius: 4px; cursor: pointer;" title="Guardar cambios"><i class="fas fa-save"></i></button>
                                                <button class="btn-toggle-catalogo" data-id="${c.id}" data-valor="${c.valor}" data-activo="${c.activo}" style="padding: 6px 10px; background: ${c.activo ? this.colors.gray : this.colors.accentGreen}; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 5px;" title="${c.activo ? 'Ocultar opción' : 'Mostrar opción'}">
                                                    <i class="fas ${c.activo ? 'fa-eye-slash' : 'fa-eye'}"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>

                        <!-- DESTINOS PATRULLA -->
                        <div style="background: white; border-radius: 10px; padding: 30px; border: 1px solid ${this.colors.border}; border-top: 5px solid #fd7e14; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                                <div>
                                    <h2 style="margin: 0; color: ${this.colors.dark}; font-size: 1.3rem;">
                                        <i class="fas fa-car-side"></i> Destinos / Sectores de Patrulla
                                    </h2>
                                    <p style="margin: 5px 0 0 0; color: ${this.colors.gray}; font-size: 0.9rem;">Opciones mostradas al operador en el formulario del C5.</p>
                                </div>
                                <div style="display: flex; gap: 10px;">
                                    <input type="text" id="nuevo-destino-input" class="form-control" placeholder="Nuevo destino..." style="padding: 8px; border: 1px solid ${this.colors.border}; border-radius: 4px;">
                                    <button class="btn-agregar-catalogo" data-tipo="destino_patrulla" data-input="nuevo-destino-input" style="padding: 8px 15px; background: #fd7e14; color: white; border: none; border-radius: 4px; cursor: pointer; transition: opacity 0.2s;"><i class="fas fa-plus"></i></button>
                                </div>
                            </div>
                            
                            <table class="dashboard-table" style="width: 100%; border-collapse: collapse;">
                                <thead>
                                    <tr style="background: ${this.colors.light}; border-bottom: 2px solid ${this.colors.border};">
                                        <th style="padding: 12px; text-align: left; color: ${this.colors.gray}; font-size: 0.85rem;">OPCIÓN (VALOR)</th>
                                        <th style="padding: 12px; text-align: center; color: ${this.colors.gray}; font-size: 0.85rem; width: 100px;">ESTADO</th>
                                        <th style="padding: 12px; text-align: center; color: ${this.colors.gray}; font-size: 0.85rem; width: 150px;">ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.catalogos.filter(c => c.tipo === 'destino_patrulla').map(c => `
                                        <tr style="border-bottom: 1px solid ${this.colors.border}; ${!c.activo ? 'opacity: 0.6;' : ''}">
                                            <td style="padding: 12px;">
                                                <input type="text" id="cat-valor-${c.id}" class="form-control" value="${c.valor}" style="width: 100%; padding: 8px; border: 1px solid ${this.colors.border}; border-radius: 4px;">
                                            </td>
                                            <td style="padding: 12px; text-align: center;">
                                                <span style="font-size: 0.8rem; padding: 4px 8px; border-radius: 12px; background: ${c.activo ? '#d4edda' : '#f8d7da'}; color: ${c.activo ? '#155724' : '#721c24'};">${c.activo ? 'Activo' : 'Oculto'}</span>
                                            </td>
                                            <td style="padding: 12px; text-align: center; white-space: nowrap;">
                                                <button class="btn-guardar-catalogo" data-id="${c.id}" data-activo="${c.activo}" style="padding: 6px 10px; background: ${this.colors.secondary}; color: white; border: none; border-radius: 4px; cursor: pointer;" title="Guardar cambios"><i class="fas fa-save"></i></button>
                                                <button class="btn-toggle-catalogo" data-id="${c.id}" data-valor="${c.valor}" data-activo="${c.activo}" style="padding: 6px 10px; background: ${c.activo ? this.colors.gray : this.colors.accentGreen}; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 5px;" title="${c.activo ? 'Ocultar opción' : 'Mostrar opción'}">
                                                    <i class="fas ${c.activo ? 'fa-eye-slash' : 'fa-eye'}"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                    ${this.catalogos.filter(c => c.tipo === 'destino_patrulla').length === 0 ? '<tr><td colspan="3" style="text-align:center; padding: 20px; color:#6c757d;">No hay destinos registrados. Puedes agregar uno arriba.</td></tr>' : ''}
                                </tbody>
                            </table>
                        </div>
                    </div> <!-- FIN TAB CATÁLOGOS -->

                    <!-- TAB: KARDEX OPERATIVO -->
                    <div id="tab-kardex" class="admin-tab-content ${this.activeTab === 'kardex' ? 'active' : ''}">
                        <div style="background: white; border-radius: 10px; padding: 30px; border: 1px solid ${this.colors.border}; border-top: 5px solid ${this.colors.accentGreen}; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                            <h2 style="margin: 0 0 20px 0; color: ${this.colors.dark}; font-size: 1.3rem;">
                                <i class="fas fa-chart-bar"></i> Productividad (Últimos 30 días)
                            </h2>
                            <div class="table-scroll-container">
                                <table class="dashboard-table" style="width: 100%; border-collapse: collapse;">
                                    <thead>
                                        <tr style="background: ${this.colors.light}; border-bottom: 2px solid ${this.colors.border};">
                                            <th style="padding: 12px; text-align: left; color: ${this.colors.gray}; font-size: 0.85rem;">OPERADOR</th>
                                            <th style="padding: 12px; text-align: center; color: ${this.colors.gray}; font-size: 0.85rem;">TURNO</th>
                                            <th style="padding: 12px; text-align: center; color: ${this.colors.gray}; font-size: 0.85rem;">LLAMADAS ATENDIDAS</th>
                                            <th style="padding: 12px; text-align: center; color: ${this.colors.gray}; font-size: 0.85rem;">REPORTES C5 ENVIADOS</th>
                                            <th style="padding: 12px; text-align: center; color: ${this.colors.primary}; font-size: 0.85rem;">TOTAL MOVIMIENTOS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${this.kardex.map(k => `
                                            <tr style="border-bottom: 1px solid ${this.colors.border};">
                                                <td style="padding: 12px; font-weight: bold;">${k.nombre_completo}</td>
                                                <td style="padding: 12px; text-align: center; text-transform: uppercase; font-size: 0.85rem;">${k.turno}</td>
                                                <td style="padding: 12px; text-align: center;">${k.total_llamadas}</td>
                                                <td style="padding: 12px; text-align: center;">${k.total_envios}</td>
                                                <td style="padding: 12px; text-align: center; font-weight: bold; font-size: 1.1rem; color: ${this.colors.primary};">${k.total_movimientos}</td>
                                            </tr>
                                        `).join('')}
                                        ${this.kardex.length === 0 ? '<tr><td colspan="5" style="text-align:center; padding: 20px; color:#6c757d;">No hay datos en los últimos 30 días</td></tr>' : ''}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div> <!-- FIN TAB KARDEX -->

                    <!-- TAB: LOGS DE AUDITORÍA -->
                    <div id="tab-logs" class="admin-tab-content ${this.activeTab === 'logs' ? 'active' : ''}">
                        <div style="background: white; border-radius: 10px; padding: 30px; border: 1px solid ${this.colors.border}; border-top: 5px solid #17a2b8; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                            <h2 style="margin: 0 0 20px 0; color: ${this.colors.dark}; font-size: 1.3rem;">
                                <i class="fas fa-list-alt"></i> Registro de Actividad
                            </h2>
                            <div class="table-scroll-container" style="max-height: 600px; overflow-y: auto;">
                                <table class="dashboard-table" style="width: 100%; border-collapse: collapse;">
                                    <thead style="position: sticky; top: 0; background: white;">
                                        <tr style="background: ${this.colors.light}; border-bottom: 2px solid ${this.colors.border};">
                                            <th style="padding: 12px; text-align: left; color: ${this.colors.gray}; font-size: 0.85rem;">FECHA Y HORA</th>
                                            <th style="padding: 12px; text-align: left; color: ${this.colors.gray}; font-size: 0.85rem;">USUARIO</th>
                                            <th style="padding: 12px; text-align: center; color: ${this.colors.gray}; font-size: 0.85rem;">ACCIÓN</th>
                                            <th style="padding: 12px; text-align: left; color: ${this.colors.gray}; font-size: 0.85rem;">DETALLES</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${this.logs.map(log => `
                                            <tr style="border-bottom: 1px solid ${this.colors.border}; font-size: 0.9rem;">
                                                <td style="padding: 12px; white-space: nowrap; color: ${this.colors.gray};">${new Date(log.fecha).toLocaleString()}</td>
                                                <td style="padding: 12px; font-weight: bold;">${log.usuario || 'Sistema'}</td>
                                                <td style="padding: 12px; text-align: center;">
                                                    <span style="background: ${this.colors.light}; padding: 4px 8px; border-radius: 4px; border: 1px solid ${this.colors.border};">${log.accion}</span>
                                                </td>
                                                <td style="padding: 12px; color: ${this.colors.dark};">${log.detalles}</td>
                                            </tr>
                                        `).join('')}
                                        ${this.logs.length === 0 ? '<tr><td colspan="4" style="text-align:center; padding: 20px; color:#6c757d;">No hay registros de actividad.</td></tr>' : ''}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div> <!-- FIN TAB LOGS -->

                    <!-- TAB: PAPELERA DE RECICLAJE -->
                    <div id="tab-papelera" class="admin-tab-content ${this.activeTab === 'papelera' ? 'active' : ''}">
                        <div style="background: white; border-radius: 10px; padding: 30px; border: 1px solid ${this.colors.border}; border-top: 5px solid ${this.colors.accentRed}; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                            <h2 style="margin: 0 0 20px 0; color: ${this.colors.dark}; font-size: 1.3rem;">
                                <i class="fas fa-trash-restore"></i> Papelera (Registros Eliminados)
                            </h2>
                            <div class="table-scroll-container">
                                <table class="dashboard-table" style="width: 100%; border-collapse: collapse;">
                                    <thead>
                                        <tr style="background: ${this.colors.light}; border-bottom: 2px solid ${this.colors.border};">
                                            <th style="padding: 12px; text-align: left; color: ${this.colors.gray}; font-size: 0.85rem;">FECHA ELIMINADO</th>
                                            <th style="padding: 12px; text-align: center; color: ${this.colors.gray}; font-size: 0.85rem;">TIPO</th>
                                            <th style="padding: 12px; text-align: left; color: ${this.colors.gray}; font-size: 0.85rem;">FOLIO</th>
                                            <th style="padding: 12px; text-align: left; color: ${this.colors.gray}; font-size: 0.85rem;">MOTIVO</th>
                                            <th style="padding: 12px; text-align: left; color: ${this.colors.gray}; font-size: 0.85rem;">BORRADO POR</th>
                                            <th style="padding: 12px; text-align: center; color: ${this.colors.gray}; font-size: 0.85rem;">ACCIÓN</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${this.trash.map(item => `
                                            <tr style="border-bottom: 1px solid ${this.colors.border};">
                                                <td style="padding: 12px; color: ${this.colors.gray};">${new Date(item.eliminado_en).toLocaleString()}</td>
                                                <td style="padding: 12px; text-align: center; font-weight: bold; color: ${item.tipo === 'Llamada' ? this.colors.primary : this.colors.accent};">${item.tipo}</td>
                                                <td style="padding: 12px;">${item.folio}</td>
                                                <td style="padding: 12px; text-transform: uppercase; font-size: 0.85rem;">${item.motivo}</td>
                                                <td style="padding: 12px; color: ${this.colors.gray};">${item.eliminado_por_nombre}</td>
                                                <td style="padding: 12px; text-align: center;">
                                                    <button class="btn-restaurar-papelera" data-id="${item.id}" data-tabla="${item.tabla}" style="padding: 8px 15px; background: ${this.colors.accentGreen}; color: white; border: none; border-radius: 4px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
                                                        <i class="fas fa-undo"></i> Restaurar
                                                    </button>
                                                </td>
                                            </tr>
                                        `).join('')}
                                        ${this.trash.length === 0 ? '<tr><td colspan="6" style="text-align:center; padding: 20px; color:#6c757d;">La papelera está vacía.</td></tr>' : ''}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div> <!-- FIN TAB PAPELERA -->

                    <!-- TAB: APROBACIÓN DE EDICIONES (SOFT LOCK) -->
                    <div id="tab-ediciones" class="admin-tab-content ${this.activeTab === 'ediciones' ? 'active' : ''}">
                        <div style="background: white; border-radius: 10px; padding: 30px; border: 1px solid ${this.colors.border}; border-top: 5px solid #ffc107; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                            <h2 style="margin: 0 0 20px 0; color: ${this.colors.dark}; font-size: 1.3rem;">
                                <i class="fas fa-edit"></i> Solicitudes de Edición (Soft Lock)
                            </h2>
                            <p style="margin: 0 0 20px 0; color: ${this.colors.gray}; font-size: 0.95rem;">
                                Revisa los intentos de modificación de los operadores. Puedes aprobarlos para que se apliquen a la base de datos o rechazarlos.
                            </p>
                            
                            <div class="table-scroll-container">
                                <table class="dashboard-table" style="width: 100%; border-collapse: collapse;">
                                    <thead>
                                        <tr style="background: ${this.colors.light}; border-bottom: 2px solid ${this.colors.border};">
                                            <th style="padding: 12px; text-align: left; color: ${this.colors.gray}; font-size: 0.85rem;">FECHA SOLICITUD</th>
                                            <th style="padding: 12px; text-align: left; color: ${this.colors.gray}; font-size: 0.85rem;">MÓDULO</th>
                                            <th style="padding: 12px; text-align: left; color: ${this.colors.gray}; font-size: 0.85rem;">REGISTRO ID</th>
                                            <th style="padding: 12px; text-align: left; color: ${this.colors.gray}; font-size: 0.85rem;">SOLICITADO POR</th>
                                            <th style="padding: 12px; text-align: center; color: ${this.colors.gray}; font-size: 0.85rem;">DATOS NUEVOS</th>
                                            <th style="padding: 12px; text-align: center; color: ${this.colors.gray}; font-size: 0.85rem;">ACCIÓN</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${this.solicitudes.map(solicitud => {
                                            const datosStr = typeof solicitud.datos_nuevos === 'string' ? solicitud.datos_nuevos : JSON.stringify(solicitud.datos_nuevos);
                                            return `
                                            <tr style="border-bottom: 1px solid ${this.colors.border};">
                                                <td style="padding: 12px; color: ${this.colors.gray};">${new Date(solicitud.creado_en).toLocaleString()}</td>
                                                <td style="padding: 12px; text-transform: uppercase; font-size: 0.85rem; font-weight: bold;">${solicitud.modulo.replace('_', ' ')}</td>
                                                <td style="padding: 12px; font-weight: bold; color: ${this.colors.primary};">#${solicitud.registro_id}</td>
                                                <td style="padding: 12px;">${solicitud.usuario_nombre || 'Desconocido'}</td>
                                                <td style="padding: 12px; text-align: center;">
                                                    <button class="btn-ver-datos-edicion" data-datos="${encodeURIComponent(datosStr)}" style="padding: 6px 12px; background: ${this.colors.light}; color: ${this.colors.dark}; border: 1px solid ${this.colors.border}; border-radius: 4px; cursor: pointer;" title="Ver cambios propuestos">
                                                        <i class="fas fa-eye"></i> Ver Datos
                                                    </button>
                                                </td>
                                                <td style="padding: 12px; text-align: center; white-space: nowrap;">
                                                    <button class="btn-aprobar-edicion" data-id="${solicitud.id}" style="padding: 8px 12px; background: ${this.colors.accentGreen}; color: white; border: none; border-radius: 4px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'" title="Aprobar y Aplicar">
                                                        <i class="fas fa-check"></i>
                                                    </button>
                                                    <button class="btn-rechazar-edicion" data-id="${solicitud.id}" style="padding: 8px 12px; background: ${this.colors.accentRed}; color: white; border: none; border-radius: 4px; cursor: pointer; transition: all 0.2s; margin-left: 5px;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'" title="Rechazar y Descartar">
                                                        <i class="fas fa-times"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        `}).join('')}
                                        ${this.solicitudes.length === 0 ? '<tr><td colspan="6" style="text-align:center; padding: 20px; color:#6c757d;">No hay solicitudes de edición pendientes.</td></tr>' : ''}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div> <!-- FIN TAB EDICIONES -->

                </div>

                <!-- MODAL: CREAR USUARIO -->
                <div id="modal-crear-usuario" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 1000; flex-direction: column; justify-content: center; align-items: center; padding: 20px;">
                    <div style="background: white; border-radius: 8px; width: 100%; max-width: 500px; padding: 30px; position: relative; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                        <button id="btn-cerrar-modal-user" style="position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 1.5rem; color: ${this.colors.gray}; cursor: pointer;">&times;</button>
                        <h2 style="color: ${this.colors.primary}; margin-top: 0; margin-bottom: 25px; font-size: 1.5rem;"><i class="fas fa-user-plus"></i> Crear Nuevo Usuario</h2>
                        
                        <form id="form-crear-usuario" onsubmit="return false;">
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; font-weight: bold; margin-bottom: 5px; font-size: 0.9rem; color: ${this.colors.dark};">Usuario (Login):</label>
                                <input type="text" id="nuevo-username" class="form-control" required style="width: 100%; padding: 10px; border: 1px solid ${this.colors.border}; border-radius: 4px;">
                            </div>
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; font-weight: bold; margin-bottom: 5px; font-size: 0.9rem; color: ${this.colors.dark};">Contraseña:</label>
                                <input type="password" id="nuevo-password" class="form-control" required style="width: 100%; padding: 10px; border: 1px solid ${this.colors.border}; border-radius: 4px;">
                            </div>
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; font-weight: bold; margin-bottom: 5px; font-size: 0.9rem; color: ${this.colors.dark};">Nombre Operativo (Completo):</label>
                                <input type="text" id="nuevo-nombre" class="form-control" required style="width: 100%; padding: 10px; border: 1px solid ${this.colors.border}; border-radius: 4px;">
                            </div>
                            <div style="display: flex; gap: 15px; margin-bottom: 25px;">
                                <div style="flex: 1;">
                                    <label style="display: block; font-weight: bold; margin-bottom: 5px; font-size: 0.9rem; color: ${this.colors.dark};">Turno:</label>
                                    <select id="nuevo-turno" class="form-control" required style="width: 100%; padding: 10px; border: 1px solid ${this.colors.border}; border-radius: 4px;">
                                        <option value="matutino">Matutino</option>
                                        <option value="vespertino">Vespertino</option>
                                        <option value="nocturno">Nocturno</option>
                                    </select>
                                </div>
                                <div style="flex: 1;">
                                    <label style="display: block; font-weight: bold; margin-bottom: 5px; font-size: 0.9rem; color: ${this.colors.dark};">Rol:</label>
                                    <select id="nuevo-rol" class="form-control" required style="width: 100%; padding: 10px; border: 1px solid ${this.colors.border}; border-radius: 4px;">
                                        <option value="operador">Operador (Estándar)</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                </div>
                            </div>
                            <button id="btn-submit-nuevo-user" style="width: 100%; padding: 12px; background: ${this.colors.primary}; color: white; border: none; border-radius: 6px; font-weight: bold; font-size: 1rem; cursor: pointer;">
                                Registrar Usuario
                            </button>
                        </form>
                    </div>
                </div>

                <!-- MODAL: CAMBIAR CONTRASEÑA -->
                <div id="modal-cambiar-password" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 1000; flex-direction: column; justify-content: center; align-items: center; padding: 20px;">
                    <div style="background: white; border-radius: 8px; width: 100%; max-width: 400px; padding: 30px; position: relative; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                        <button id="btn-cerrar-modal-password" style="position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 1.5rem; color: ${this.colors.gray}; cursor: pointer;">&times;</button>
                        <h2 style="color: ${this.colors.primary}; margin-top: 0; margin-bottom: 10px; font-size: 1.3rem;"><i class="fas fa-key"></i> Cambiar Contraseña</h2>
                        <p style="color: ${this.colors.gray}; font-size: 0.9rem; margin-bottom: 20px;">Actualizando la contraseña para el usuario: <strong id="pass-modal-username"></strong></p>
                        
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; font-weight: bold; margin-bottom: 5px; font-size: 0.9rem; color: ${this.colors.dark};">Nueva Contraseña:</label>
                            <input type="password" id="input-nueva-password" class="form-control" style="width: 100%; padding: 10px; border: 1px solid ${this.colors.border}; border-radius: 4px;">
                        </div>
                        <button id="btn-submit-password" class="btn btn-primary" style="width: 100%; padding: 12px; background: ${this.colors.primary}; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
                            Actualizar Contraseña
                        </button>
                        <input type="hidden" id="pass-modal-userid" value="">
                    </div>
                </div>

            </div>
        `;
    }

    bindEvents() {
        const btnVolver = this.container.querySelector('.btn-back-to-main');
        if (btnVolver) {
            btnVolver.addEventListener('click', () => {
                this.appController.goToDashboard();
            });
        }

        // Tab Switching
        this.container.querySelectorAll('.admin-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetTab = e.currentTarget.getAttribute('data-tab');
                this.activeTab = targetTab;
                
                // Update buttons
                this.container.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                
                // Update content
                this.container.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
                this.container.querySelector(`#tab-${targetTab}`).classList.add('active');
            });
        });

        // Toggle Event - Reset Diario
        try {
            const toggleReset = this.container.querySelector('#toggle-reset-diario');
            const slider = this.container.querySelector('.slider');
            const sliderDot = this.container.querySelector('.slider span');
            const statusText = this.container.querySelector('#reset-status-text');

            if (toggleReset) {
                toggleReset.addEventListener('change', async (e) => {
                    const isChecked = e.target.checked;
                    
                    // Optimistic UI update
                    if(slider) slider.style.backgroundColor = isChecked ? this.colors.accentGreen : '#ccc';
                    if(sliderDot) sliderDot.style.left = isChecked ? '28px' : '4px';
                    if(statusText) {
                        statusText.textContent = isChecked ? 'ACTIVADO' : 'DESACTIVADO';
                        statusText.style.color = isChecked ? this.colors.accentGreen : this.colors.gray;
                    }

                    try {
                        let baseUrl = window.AppConfig ? window.AppConfig.API_BASE_URL : '/api';
                        const response = await fetch(`${baseUrl}/admin/settings`, {
                            method: 'PUT',
                            headers: window.LlamadasService ? window.LlamadasService.getAuthHeaders() : { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                            body: JSON.stringify({ reset_diario_activo: isChecked })
                        });
                        
                        const data = await response.json();
                        if (!data.success) throw new Error(data.message || 'Error guardando configuración');
                        
                        Toast.show('Configuración actualizada correctamente', 'success');
                    } catch (error) {
                        // Revert UI if error
                        toggleReset.checked = !isChecked;
                        if(slider) slider.style.backgroundColor = !isChecked ? this.colors.accentGreen : '#ccc';
                        if(sliderDot) sliderDot.style.left = !isChecked ? '28px' : '4px';
                        if(statusText) {
                            statusText.textContent = !isChecked ? 'ACTIVADO' : 'DESACTIVADO';
                            statusText.style.color = !isChecked ? this.colors.accentGreen : this.colors.gray;
                        }
                        
                        Toast.show('Error al guardar: ' + error.message, 'error');
                    }
                });
            }
        } catch (err) {
            console.error('Error binding toggleReset', err);
        }

        // Toggle Event - Mantenimiento
        try {
            const toggleMantenimiento = this.container.querySelector('#toggle-mantenimiento');
            const sliderMantenimiento = this.container.querySelector('.slider-mantenimiento');
            const sliderDotMantenimiento = this.container.querySelector('.slider-dot-mantenimiento');
            const statusTextMantenimiento = this.container.querySelector('.maintenance-status-text');

            if (toggleMantenimiento) {
                toggleMantenimiento.addEventListener('change', async (e) => {
                    const isChecked = e.target.checked;
                    
                    if (isChecked) {
                        if (!confirm('¿Estás seguro de activar el Modo Mantenimiento? Esto desconectará a todos los operadores inmediatamente y no podrán iniciar sesión hasta que lo desactives.')) {
                            e.target.checked = false;
                            return;
                        }
                    }

                    // Optimistic UI update
                    if(sliderMantenimiento) sliderMantenimiento.style.backgroundColor = isChecked ? this.colors.accentRed : '#ccc';
                    if(sliderDotMantenimiento) sliderDotMantenimiento.style.left = isChecked ? '28px' : '4px';
                    if(statusTextMantenimiento) {
                        statusTextMantenimiento.textContent = isChecked ? 'ACTIVADO' : 'DESACTIVADO';
                        statusTextMantenimiento.style.color = isChecked ? this.colors.accentRed : this.colors.gray;
                    }

                    try {
                        let baseUrl = window.AppConfig ? window.AppConfig.API_BASE_URL : '/api';
                        const response = await fetch(`${baseUrl}/admin/settings`, {
                            method: 'PUT',
                            headers: window.LlamadasService ? window.LlamadasService.getAuthHeaders() : { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                            body: JSON.stringify({ modo_mantenimiento: isChecked })
                        });
                        
                        const data = await response.json();
                        if (!data.success) throw new Error(data.message || 'Error guardando configuración');
                        
                        Toast.show(isChecked ? 'Modo Mantenimiento ACTIVADO. Operadores desconectados.' : 'Modo Mantenimiento DESACTIVADO.', 'success');
                        await this.loadLogs();
                        this.renderContent();
                    } catch (error) {
                        // Revert UI if error
                        toggleMantenimiento.checked = !isChecked;
                        if(sliderMantenimiento) sliderMantenimiento.style.backgroundColor = !isChecked ? this.colors.accentRed : '#ccc';
                        if(sliderDotMantenimiento) sliderDotMantenimiento.style.left = !isChecked ? '28px' : '4px';
                        if(statusTextMantenimiento) {
                            statusTextMantenimiento.textContent = !isChecked ? 'ACTIVADO' : 'DESACTIVADO';
                            statusTextMantenimiento.style.color = !isChecked ? this.colors.accentRed : this.colors.gray;
                        }
                        
                        Toast.show('Error al guardar: ' + error.message, 'error');
                    }
                });
            }
        } catch (err) {
            console.error('Error binding toggleMantenimiento', err);
        }

        // Toggle Event - Edición Estricta (Soft Lock)
        try {
            const toggleEdicion = this.container.querySelector('#toggle-edicion-estricta');
            const sliderEdicion = this.container.querySelector('.slider-edicion');
            const sliderDotEdicion = this.container.querySelector('.slider-dot-edicion');
            const statusTextEdicion = this.container.querySelector('.edicion-status-text');

            if (toggleEdicion) {
                toggleEdicion.addEventListener('change', async (e) => {
                    const isChecked = e.target.checked;
                    
                    // Optimistic UI update
                    if(sliderEdicion) sliderEdicion.style.backgroundColor = isChecked ? this.colors.accentGreen : '#ccc';
                    if(sliderDotEdicion) sliderDotEdicion.style.left = isChecked ? '28px' : '4px';
                    if(statusTextEdicion) {
                        statusTextEdicion.textContent = isChecked ? 'ACTIVADO' : 'DESACTIVADO';
                        statusTextEdicion.style.color = isChecked ? this.colors.accentGreen : this.colors.gray;
                    }

                    try {
                        let baseUrl = window.AppConfig ? window.AppConfig.API_BASE_URL : '/api';
                        const response = await fetch(`${baseUrl}/admin/settings`, {
                            method: 'PUT',
                            headers: window.LlamadasService ? window.LlamadasService.getAuthHeaders() : { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                            body: JSON.stringify({ edicion_estricta: isChecked })
                        });
                        
                        const data = await response.json();
                        if (!data.success) throw new Error(data.message || 'Error guardando configuración');
                        
                        Toast.show('Configuración actualizada correctamente', 'success');
                    } catch (error) {
                        // Revert UI if error
                        toggleEdicion.checked = !isChecked;
                        if(sliderEdicion) sliderEdicion.style.backgroundColor = !isChecked ? this.colors.accentGreen : '#ccc';
                        if(sliderDotEdicion) sliderDotEdicion.style.left = !isChecked ? '28px' : '4px';
                        if(statusTextEdicion) {
                            statusTextEdicion.textContent = !isChecked ? 'ACTIVADO' : 'DESACTIVADO';
                            statusTextEdicion.style.color = !isChecked ? this.colors.accentGreen : this.colors.gray;
                        }
                        
                        Toast.show('Error al guardar: ' + error.message, 'error');
                    }
                });
            }
        } catch (err) {
            console.error('Error binding toggleEdicion', err);
        }

        // User Save Events
        this.container.querySelectorAll('.btn-guardar-usuario').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const btnSave = e.currentTarget;
                const userId = btnSave.getAttribute('data-id');
                const nameInput = this.container.querySelector(`#user-name-${userId}`);
                const loginInput = this.container.querySelector(`#user-login-${userId}`);
                const ipInput = this.container.querySelector(`#user-ip-${userId}`);
                const newName = nameInput.value.trim();
                const newLogin = loginInput.value.trim();
                const newIp = ipInput.value.trim();

                if (!newName || !newLogin) {
                    Toast.show('El login y nombre no pueden estar vacíos', 'warning');
                    return;
                }

                const originalHtml = btnSave.innerHTML;
                btnSave.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                btnSave.disabled = true;

                try {
                    const response = await fetch(`/api/admin/users/${userId}`, {
                        method: 'PUT',
                        headers: LlamadasService.getAuthHeaders(),
                        body: JSON.stringify({ username: newLogin, nombre_completo: newName, ip_permitida: newIp })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        Toast.show('Usuario actualizado correctamente', 'success');
                        btnSave.style.background = this.colors.accentGreen;
                        btnSave.innerHTML = '<i class="fas fa-check"></i>';
                        setTimeout(() => {
                            btnSave.style.background = this.colors.primary;
                            btnSave.innerHTML = originalHtml;
                            btnSave.disabled = false;
                        }, 2000);
                    } else {
                        throw new Error(data.message || 'Error al actualizar');
                    }
                } catch (error) {
                    Toast.show('Error al guardar: ' + error.message, 'error');
                    btnSave.innerHTML = originalHtml;
                    btnSave.disabled = false;
                }
            });
        });

        // Eventos Modales
        const modalNuevoUser = this.container.querySelector('#modal-crear-usuario');
        const modalCambiarPass = this.container.querySelector('#modal-cambiar-password');

        this.container.querySelector('#btn-nuevo-usuario').addEventListener('click', () => {
            modalNuevoUser.style.display = 'flex';
        });

        this.container.querySelector('#btn-cerrar-modal-user').addEventListener('click', () => {
            modalNuevoUser.style.display = 'none';
        });

        this.container.querySelector('#btn-cerrar-modal-password').addEventListener('click', () => {
            modalCambiarPass.style.display = 'none';
        });

        // Crear Nuevo Usuario Request
        this.container.querySelector('#btn-submit-nuevo-user').addEventListener('click', async () => {
            const username = this.container.querySelector('#nuevo-username').value.trim();
            const password = this.container.querySelector('#nuevo-password').value;
            const nombre = this.container.querySelector('#nuevo-nombre').value.trim();
            const turno = this.container.querySelector('#nuevo-turno').value;
            const rol = this.container.querySelector('#nuevo-rol').value;

            if (!username || !password || !nombre || !turno || !rol) {
                Toast.show('Completa todos los campos para crear el usuario', 'warning');
                return;
            }

            const btnForm = this.container.querySelector('#btn-submit-nuevo-user');
            const originalText = btnForm.textContent;
            btnForm.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';
            btnForm.disabled = true;

            try {
                const response = await fetch('/api/admin/users', {
                    method: 'POST',
                    headers: LlamadasService.getAuthHeaders(),
                    body: JSON.stringify({ username, password, nombre_completo: nombre, turno, rol })
                });

                const data = await response.json();
                
                if (data.success) {
                    Toast.show('Usuario creado exitosamente', 'success');
                    modalNuevoUser.style.display = 'none';
                    this.container.querySelector('#form-crear-usuario').reset();
                    // Refrescar tabla de usuarios en lugar de recargar página entera
                    await this.loadUsers();
                    const newContainer = this.container;
                    newContainer.innerHTML = this.getTemplate();
                    this.bindEvents(); // Re-bind con la nueva tabla
                } else {
                    throw new Error(data.message || 'Error al crear usuario');
                }
            } catch (error) {
                Toast.show('Error: ' + error.message, 'error');
            } finally {
                if (btnForm) {
                    btnForm.textContent = originalText;
                    btnForm.disabled = false;
                }
            }
        });

        // Cambiar Password Event setup (per row button)
        this.container.querySelectorAll('.btn-cambiar-password').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = e.currentTarget.getAttribute('data-id');
                const username = e.currentTarget.getAttribute('data-username');
                
                this.container.querySelector('#pass-modal-username').textContent = username;
                this.container.querySelector('#pass-modal-userid').value = userId;
                this.container.querySelector('#input-nueva-password').value = '';
                
                modalCambiarPass.style.display = 'flex';
            });
        });

        // Submit Cambiar Password
        this.container.querySelector('#btn-submit-password').addEventListener('click', async () => {
            const userId = this.container.querySelector('#pass-modal-userid').value;
            const newPassword = this.container.querySelector('#input-nueva-password').value;

            if (!newPassword || newPassword.trim() === '') {
                Toast.show('Ingresa una nueva contraseña', 'warning');
                return;
            }

            const btnForm = this.container.querySelector('#btn-submit-password');
            const originalText = btnForm.textContent;
            btnForm.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
            btnForm.disabled = true;

            try {
                const response = await fetch(`/api/admin/users/${userId}/password`, {
                    method: 'PUT',
                    headers: LlamadasService.getAuthHeaders(),
                    body: JSON.stringify({ new_password: newPassword })
                });
                
                const data = await response.json();
                if (data.success) {
                    Toast.show('Contraseña actualizada', 'success');
                    modalCambiarPass.style.display = 'none';
                } else {
                    throw new Error(data.message || 'Error al actualizar contraseña');
                }
            } catch (error) {
                Toast.show('Error: ' + error.message, 'error');
            } finally {
                btnForm.textContent = originalText;
                btnForm.disabled = false;
            }
        });

        // ==========================================
        // LOTE C: GESTIÓN DE CATÁLOGOS
        // ==========================================

        // Agregar nuevo elemento al catálogo
        this.container.querySelectorAll('.btn-agregar-catalogo').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const btnAdd = e.currentTarget;
                const tipo = btnAdd.getAttribute('data-tipo');
                const inputId = btnAdd.getAttribute('data-input');
                const inputEl = this.container.querySelector(`#${inputId}`);
                const valor = inputEl.value.trim();

                if (!valor) {
                    Toast.show('Escribe un valor para agregar', 'warning');
                    return;
                }

                const originalHtml = btnAdd.innerHTML;
                btnAdd.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                btnAdd.disabled = true;

                try {
                    const response = await fetch('/api/admin/catalogos', {
                        method: 'POST',
                        headers: LlamadasService.getAuthHeaders(),
                        body: JSON.stringify({ tipo, valor })
                    });
                    
                    const data = await response.json();
                    if (data.success) {
                        Toast.show('Opción guardada exitosamente', 'success');
                        inputEl.value = '';
                        await this.loadCatalogos();
                        this.renderContent();
                    } else {
                        throw new Error(data.message || 'Error al guardar opción');
                    }
                } catch (error) {
                    Toast.show('Error: ' + error.message, 'error');
                } finally {
                    btnAdd.innerHTML = originalHtml;
                    btnAdd.disabled = false;
                }
            });
        });

        // Guardar edición de texto de un elemento
        this.container.querySelectorAll('.btn-guardar-catalogo').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const btnSave = e.currentTarget;
                const id = btnSave.getAttribute('data-id');
                const activo = btnSave.getAttribute('data-activo') === 'true';
                const inputEl = this.container.querySelector(`#cat-valor-${id}`);
                const valor = inputEl.value.trim();

                if (!valor) {
                    Toast.show('El valor no puede estar vacío', 'warning');
                    return;
                }

                const originalHtml = btnSave.innerHTML;
                btnSave.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                btnSave.disabled = true;

                try {
                    const response = await fetch(`/api/admin/catalogos/${id}`, {
                        method: 'PUT',
                        headers: LlamadasService.getAuthHeaders(),
                        body: JSON.stringify({ valor, activo })
                    });
                    
                    const data = await response.json();
                    if (data.success) {
                        Toast.show('Opción actualizada', 'success');
                        await this.loadCatalogos();
                        this.renderContent();
                    } else {
                        throw new Error(data.message || 'Error al actualizar opción');
                    }
                } catch (error) {
                    Toast.show('Error: ' + error.message, 'error');
                } finally {
                    // Not strictly needed since renderContent() redraws, but good practice
                    if(this.container.contains(btnSave)) {
                        btnSave.innerHTML = originalHtml;
                        btnSave.disabled = false;
                    }
                }
            });
        });

        // Toggle visibility (Activo/Inactivo) de un elemento
        this.container.querySelectorAll('.btn-toggle-catalogo').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const btnToggle = e.currentTarget;
                const id = btnToggle.getAttribute('data-id');
                const valorObj = btnToggle.getAttribute('data-valor');
                const isCurrentlyActive = btnToggle.getAttribute('data-activo') === 'true';
                const newStatus = !isCurrentlyActive;

                const originalHtml = btnToggle.innerHTML;
                btnToggle.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                btnToggle.disabled = true;

                try {
                    const response = await fetch(`/api/admin/catalogos/${id}`, {
                        method: 'PUT',
                        headers: LlamadasService.getAuthHeaders(),
                        body: JSON.stringify({ valor: valorObj, activo: newStatus })
                    });
                    
                    const data = await response.json();
                    if (data.success) {
                        Toast.show(newStatus ? 'Opción mostrada nuevamente' : 'Opción ocultada exitosamente', 'success');
                        await this.loadCatalogos();
                        this.renderContent();
                    } else {
                        throw new Error(data.message || 'Error al cambiar estado');
                    }
                } catch (error) {
                    Toast.show('Error: ' + error.message, 'error');
                    btnToggle.innerHTML = originalHtml;
                    btnToggle.disabled = false;
                }
            });
        });

        // Lote B: Global Broadcast Event
        try {
            const btnBroadcast = this.container.querySelector('#btn-send-broadcast');
            if (btnBroadcast) {
                btnBroadcast.addEventListener('click', async () => {
                    const msgInput = this.container.querySelector('#input-broadcast-msg');
                    const typeInput = this.container.querySelector('#input-broadcast-type');
                    const message = msgInput ? msgInput.value.trim() : '';
                    const type = typeInput ? typeInput.value : 'info';

                    if (!message) {
                        Toast.show('Escribe un mensaje para enviar', 'warning');
                        return;
                    }

                    if (!confirm('¿Enviar este mensaje a todos los operadores conectados ahora mismo?')) return;

                    const originalHtml = btnBroadcast.innerHTML;
                    btnBroadcast.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                    btnBroadcast.disabled = true;

                    try {
                        let baseUrl = window.AppConfig ? window.AppConfig.API_BASE_URL : '/api';
                        const response = await fetch(`${baseUrl}/admin/broadcast`, {
                            method: 'POST',
                            headers: window.LlamadasService ? window.LlamadasService.getAuthHeaders() : { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                            body: JSON.stringify({ message, type })
                        });
                        const data = await response.json();

                        if (data.success) {
                            Toast.show('Mensaje global enviado', 'success');
                            if(msgInput) msgInput.value = '';
                            await this.loadLogs();
                            this.renderContent();
                        } else {
                            throw new Error(data.message || 'Error al enviar mensaje');
                        }
                    } catch (error) {
                        Toast.show('Error: ' + error.message, 'error');
                    } finally {
                        btnBroadcast.innerHTML = originalHtml;
                        btnBroadcast.disabled = false;
                    }
                });
            }
        } catch (err) {
            console.error('Error binding btnBroadcast', err);
        }

        // Lote B: Force Logout Events
        this.container.querySelectorAll('.btn-forzar-cierre').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const btnLogout = e.currentTarget;
                const userId = btnLogout.getAttribute('data-id');
                const username = btnLogout.getAttribute('data-username');

                if (!confirm(`¿Estás seguro de forzar el cierre de sesión del usuario ${username}? Si está activo, lo sacará inmediatamente del sistema.`)) return;

                const originalHtml = btnLogout.innerHTML;
                btnLogout.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                btnLogout.disabled = true;

                try {
                    const response = await fetch('/api/admin/force-logout', {
                        method: 'POST',
                        headers: LlamadasService.getAuthHeaders(),
                        body: JSON.stringify({ userId })
                    });
                    const data = await response.json();

                    if (data.success) {
                        Toast.show(`Comando de expulsión enviado a ${username}`, 'success');
                        await this.loadLogs();
                        this.renderContent();
                    } else {
                        throw new Error(data.message || 'Error al expulsar usuario');
                    }
                } catch (error) {
                    Toast.show('Error: ' + error.message, 'error');
                } finally {
                    btnLogout.innerHTML = originalHtml;
                    btnLogout.disabled = false;
                }
            });
        });

        // Restore Trash Events
        this.container.querySelectorAll('.btn-restaurar-papelera').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const btnRestore = e.currentTarget;
                const id = btnRestore.getAttribute('data-id');
                const tabla = btnRestore.getAttribute('data-tabla');

                if (!confirm('¿Estás seguro de querer restaurar este registro? Volverá a aparecer en los dashboards correspondientes.')) return;

                const originalHtml = btnRestore.innerHTML;
                btnRestore.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Restaurando...';
                btnRestore.disabled = true;

                try {
                    const response = await fetch('/api/admin/trash/restore', {
                        method: 'PUT',
                        headers: LlamadasService.getAuthHeaders(),
                        body: JSON.stringify({ id, tabla })
                    });
                    const data = await response.json();

                    if (data.success) {
                        Toast.show('Registro restaurado exitosamente', 'success');
                        await this.loadTrash();
                        await this.loadLogs(); // Refresh logs as restoration creates a log
                        this.renderContent(); // Re-render to show updated trash table
                    } else {
                        throw new Error(data.message || 'Error al restaurar');
                    }
                } catch (error) {
                    Toast.show('Error: ' + error.message, 'error');
                    btnRestore.innerHTML = originalHtml;
                    btnRestore.disabled = false;
                }
            });
        });

        // ==========================================
        // LOTE C: APROBACIÓN DE EDICIONES (SOFT LOCK)
        // ==========================================

        this.container.querySelectorAll('.btn-ver-datos-edicion').forEach(btn => {
            btn.addEventListener('click', (e) => {
                try {
                    const datosRaw = decodeURIComponent(e.currentTarget.getAttribute('data-datos'));
                    const datos = JSON.parse(datosRaw);
                    
                    let htmlData = '<div style="text-align: left; background: #f8f9fa; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 0.9rem; max-height: 400px; overflow-y: auto;">';
                    htmlData += '<table style="width: 100%; border-collapse: collapse;">';
                    htmlData += '<thead><tr style="border-bottom: 2px solid #dee2e6;"><th>Campo</th><th>Nuevo Valor</th></tr></thead><tbody>';
                    
                    for (const [key, value] of Object.entries(datos)) {
                        htmlData += `<tr style="border-bottom: 1px solid #dee2e6;"><td style="padding: 8px; font-weight: bold; color: #495057;">${key}</td><td style="padding: 8px; color: #212529;">${value || '<em style="color:#6c757d;">(Vacío)</em>'}</td></tr>`;
                    }
                    htmlData += '</tbody></table></div>';
                    
                    Swal.fire({
                        title: 'Datos Propuestos',
                        html: htmlData,
                        width: '600px',
                        confirmButtonText: 'Cerrar',
                        confirmButtonColor: this.colors.primary
                    });
                } catch (err) {
                    Toast.show('Error al leer los datos de la propuesta', 'error');
                    console.error('Error parsing datos edición:', err);
                }
            });
        });

        const handleResolution = async (id, accion, btnElement) => {
            const endpoint = `/api/admin/solicitudes-edicion/${id}/${accion}`;
            const originalHtml = btnElement.innerHTML;
            
            btnElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            btnElement.disabled = true;
            
            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: LlamadasService.getAuthHeaders()
                });
                
                const data = await response.json();
                
                if (data.success) {
                    Toast.show(`Propuesta de edición ${accion === 'aprobar' ? 'aprobada' : 'rechazada'}`, 'success');
                    await Promise.all([this.loadSolicitudes(), this.loadLogs()]);
                    this.renderContent(); // Re-render table and active tab
                    // Re-activate specific tab since renderContent() resets view
                    const tabIds = ['usuarios', 'catalogos', 'kardex', 'logs', 'papelera', 'ediciones'];
                    tabIds.forEach(t => {
                        this.container.querySelector(`.admin-tab-btn[data-tab="${t}"]`)?.classList.remove('active');
                        this.container.querySelector(`#tab-${t}`)?.classList.remove('active');
                    });
                    this.container.querySelector('.admin-tab-btn[data-tab="ediciones"]')?.classList.add('active');
                    this.container.querySelector('#tab-ediciones')?.classList.add('active');

                } else {
                    throw new Error(data.message || `Error al ${accion} la propuesta`);
                }
            } catch (error) {
                Toast.show('Error: ' + error.message, 'error');
                btnElement.innerHTML = originalHtml;
                btnElement.disabled = false;
            }
        };

        this.container.querySelectorAll('.btn-aprobar-edicion').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                if(confirm('¿Aprobar estos cambios? Se actualizará el registro permanentemente.')) {
                    handleResolution(id, 'aprobar', e.currentTarget);
                }
            });
        });

        this.container.querySelectorAll('.btn-rechazar-edicion').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                if(confirm('¿Rechazar estos cambios? Se descartará la propuesta.')) {
                    handleResolution(id, 'rechazar', e.currentTarget);
                }
            });
        });

        // ==========================================
        // LOTE C: EXPORTACIÓN MAESTRA (RESPALDO ZIP)
        // ==========================================
        try {
            const btnBackup = this.container.querySelector('#btn-descargar-backup');
            if (btnBackup) {
                btnBackup.addEventListener('click', async () => {
                    const originalHtml = btnBackup.innerHTML;
                    btnBackup.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando ZIP...';
                    btnBackup.disabled = true;

                    try {
                        let baseUrl = window.AppConfig ? window.AppConfig.API_BASE_URL : '/api';
                        const response = await fetch(`${baseUrl}/admin/master-backup`, {
                            method: 'GET',
                            headers: window.LlamadasService ? window.LlamadasService.getAuthHeaders() : { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                        });

                        if (!response.ok) {
                            try {
                                const errorData = await response.json();
                                throw new Error(errorData.message || 'Error al generar el respaldo');
                            } catch(e) {
                                throw new Error(`HTTP Error: ${response.status}`);
                            }
                        }

                        // Handle Blob download
                        const blob = await response.blob();
                        
                        // Extract filename from Content-Disposition if available
                        let filename = `Respaldo_Maestro_C4_${new Date().toISOString().replace(/[:.]/g, '-')}.zip`;
                        const disposition = response.headers.get('Content-Disposition');
                        if (disposition && disposition.indexOf('filename=') !== -1) {
                            const matches = /filename="([^"]+)"/.exec(disposition);
                            if (matches != null && matches[1]) filename = matches[1];
                        }

                        const downloadUrl = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.style.display = 'none';
                        a.href = downloadUrl;
                        a.download = filename;
                        document.body.appendChild(a);
                        a.click();
                        
                        setTimeout(() => {
                            window.URL.revokeObjectURL(downloadUrl);
                            document.body.removeChild(a);
                        }, 100);

                        Toast.show('Respaldo maestro generado con éxito', 'success');

                    } catch (error) {
                        console.error('Download error:', error);
                        Toast.show('Error: ' + error.message, 'error');
                    } finally {
                        btnBackup.innerHTML = originalHtml;
                        btnBackup.disabled = false;
                    }
                });
            }
        } catch (err) {
            console.error('Error binding btnBackup', err);
        }
    }
}

window.AdminSettingsView = AdminSettingsView;
